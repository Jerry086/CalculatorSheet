import React, { useState, useEffect } from "react";
import Formula from "./Formula";
import Status from "./Status";
import KeyPad from "./KeyPad";
import SpreadSheetClient from "../Engine/SpreadSheetClient";
import SheetHolder from "./SheetHolder";
import "./SpreadSheet.css"; // Import the CSS file
import ChatComponent from './ChatComponent';
import ChatClient from "../Engine/ChatClient";

import { ButtonNames } from "../Engine/GlobalDefinitions";
import ServerSelector from "./ServerSelector";


interface SpreadSheetProps {
  documentName: string;
  spreadSheetClient: SpreadSheetClient;
  chatClient: ChatClient;
}

/**
 * the main component for the Spreadsheet.  It is the parent of all the other components
 * 
 *
 * */

// create the client that talks to the backend.

function SpreadSheet({ documentName, spreadSheetClient, chatClient }: SpreadSheetProps) {
  const [formulaString, setFormulaString] = useState(spreadSheetClient.getFormulaString())
  const [resultString, setResultString] = useState(spreadSheetClient.getResultString())
  const [cells, setCells] = useState(spreadSheetClient.getSheetDisplayStringsForGUI());
  const [statusString, setStatusString] = useState(spreadSheetClient.getEditStatusString());
  const [currentCell, setCurrentCell] = useState(spreadSheetClient.getWorkingCellLabel());
  const [currentlyEditing, setCurrentlyEditing] = useState(spreadSheetClient.getEditStatus());
  const [userName, setUserName] = useState(window.sessionStorage.getItem('userName') || "");
  const [serverSelected, setServerSelected] = useState("localhost");
  const [isSheetLocked, setIsSheetLocked] = useState(false);
  const [isMessengerLocked, setIsMessengerLocked] = useState(false);


  function updateDisplayValues(): void {
    spreadSheetClient.userName = userName;
    spreadSheetClient.documentName = documentName;
    setFormulaString(spreadSheetClient.getFormulaString());
    setResultString(spreadSheetClient.getResultString());
    setStatusString(spreadSheetClient.getEditStatusString());
    setCells(spreadSheetClient.getSheetDisplayStringsForGUI());
    setCurrentCell(spreadSheetClient.getWorkingCellLabel());
    setCurrentlyEditing(spreadSheetClient.getEditStatus());
  }

  // useEffect to refetch the data every 1/20 of a second
  useEffect(() => {
    const interval = setInterval(() => {
      updateDisplayValues();
    }, 50);
    return () => clearInterval(interval);
  });


  function lockItemsSheet() {
    //todo fake logic -  call actual backend - same as login page
    console.log("called lockItemsSheet - isSheetLocked is", isSheetLocked);
    setIsSheetLocked(!isSheetLocked);
    console.log("finished lockItemsSheet - isSheetLocked is", isSheetLocked);
  
  }

  
  function lockItemsMessenger() {
    //todo fake logic -  call actual backend - same as login page
    console.log("called lockItemsMessenger - isMessengerLocked is", isMessengerLocked);
    setIsMessengerLocked(!isMessengerLocked);
    console.log("finished lockItemsMessenger - isMessengerLocked is", isMessengerLocked);
  
  }


  function returnToLoginPage() {

    // set the document name
    spreadSheetClient.documentName = documentName;
    // reload the page

    // the href needs to be updated.   Remove /<sheetname> from the end of the URL
    const href = window.location.href;
    const index = href.lastIndexOf('/');
    let newURL = href.substring(0, index);
    newURL = newURL + "/documents";
    window.history.pushState({}, '', newURL);
    window.location.reload();

  }

  function checkUserName(): boolean {
    if (userName === "") {
      alert("Please enter a user name");
      return false;
    }
    return true;
  }

  /**
   * 
   * @param event 
   * 
   * This function is the call back for the command buttons
   * 
   * It will call the machine to process the command button
   * 
   * the buttons done, edit, clear, all clear, and restart do not require asynchronous processing
   * 
   * the other buttons do require asynchronous processing and so the function is marked async
   */
  async function onCommandButtonClick(text: string): Promise<void> {

    if (!checkUserName()) {
      return;
    }

    switch (text) {


      case ButtonNames.edit_toggle:
        if (currentlyEditing) {
          spreadSheetClient.setEditStatus(false);
        } else {
          spreadSheetClient.setEditStatus(true);
        }
        setStatusString(spreadSheetClient.getEditStatusString());
        break;

      case ButtonNames.clear:
        spreadSheetClient.removeToken();
        break;

      case ButtonNames.allClear:
        spreadSheetClient.clearFormula();
        break;

    }
    // update the display values
    updateDisplayValues();
  }

  /**
   *  This function is the call back for the number buttons and the Parenthesis buttons
   * 
   * They all automatically start the editing of the current formula.
   * 
   * @param event
   * 
   * */
  function onButtonClick(event: React.MouseEvent<HTMLButtonElement>): void {
    if (!checkUserName()) {
      return;
    }
    const text = event.currentTarget.textContent;
    let trueText = text ? text : "";
    spreadSheetClient.setEditStatus(true);
    spreadSheetClient.addToken(trueText);

    updateDisplayValues();

  }

  // this is to help with development,  it allows us to select the server
  function serverSelector(buttonName: string) {
    setServerSelected(buttonName);
    spreadSheetClient.setServerSelector(buttonName);
  }


  /**
   * 
   * @param event 
   * 
   * This function is called when a cell is clicked
   * If the edit status is true then it will send the token to the machine.
   * If the edit status is false then it will ask the machine to update the current formula.
   */
  function onCellClick(event: React.MouseEvent<HTMLButtonElement>): void {

    if (userName === "") {
      alert("Please enter a user name");
      return;
    }
    const cellLabel = event.currentTarget.getAttribute("cell-label");
    // calculate the current row and column of the clicked on cell

    const editStatus = spreadSheetClient.getEditStatus();
    let realCellLabel = cellLabel ? cellLabel : "";


    // if the edit status is true then add the token to the machine
    if (editStatus) {
      spreadSheetClient.addCell(realCellLabel);  // this will never be ""
      updateDisplayValues();
    }
    // if the edit status is false then set the current cell to the clicked on cell
    else {
      spreadSheetClient.requestViewByLabel(realCellLabel);

      updateDisplayValues();
    }

  }

  return (
    <div>
      <div>
        <Status statusString={statusString} userName={userName}></Status>
        <Formula formulaString={formulaString} resultString={resultString}  ></Formula>
        {<SheetHolder cellsValues={cells}
          onClick={onCellClick}
          currentCell={currentCell}
          currentlyEditing={currentlyEditing} ></SheetHolder>}
        <KeyPad 
        isLocked={isSheetLocked} //TODO some param from backend
        
        onButtonClick={onButtonClick}
          onCommandButtonClick={onCommandButtonClick}
          currentlyEditing={currentlyEditing}></KeyPad>
        <ServerSelector serverSelector={serverSelector} serverSelected={serverSelected} />
        <button onClick={returnToLoginPage} className="returnToLoginButton">Return to Login Page</button>
        <br ></br>
        {userName === "Admin" && <div> 
        <button onClick={lockItemsSheet} className="returnToLoginButton">Lock Sheet</button>
        <button onClick={lockItemsMessenger} className="returnToLoginButton">Lock Messenger</button>
        </div>
        }


      </div>
      {userName && <ChatComponent  userName={userName} chatClient={chatClient}  isLocked={isMessengerLocked} // //TODO some param from backend
      />}
    </div>

  )
};

export default SpreadSheet;
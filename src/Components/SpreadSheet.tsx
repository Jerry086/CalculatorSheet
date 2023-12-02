import React, { useState, useEffect } from "react";
import Formula from "./Formula";
import Status from "./Status";
import KeyPad from "./KeyPad";
import SpreadSheetClient from "../Engine/SpreadSheetClient";
import SheetHolder from "./SheetHolder";
import "./SpreadSheet.css"; // Import the CSS file
import ChatComponent from './ChatComponent';

import { ButtonNames } from "../Engine/GlobalDefinitions";
import ServerSelector from "./ServerSelector";
import { isSnapshotPath } from "jest-snapshot";


interface SpreadSheetProps {
  documentName: string;
  spreadSheetClient: SpreadSheetClient;
}

/**
 * the main component for the Spreadsheet.  It is the parent of all the other components
 * 
 *
 * */

// create the client that talks to the backend.

function SpreadSheet({ documentName, spreadSheetClient }: SpreadSheetProps) {
  const [formulaString, setFormulaString] = useState(spreadSheetClient.getFormulaString())
  const [resultString, setResultString] = useState(spreadSheetClient.getResultString())
  const [cells, setCells] = useState(spreadSheetClient.getSheetDisplayStringsForGUI());
  const [statusString, setStatusString] = useState(spreadSheetClient.getEditStatusString());
  const [currentCell, setCurrentCell] = useState(spreadSheetClient.getWorkingCellLabel());
  const [currentlyEditing, setCurrentlyEditing] = useState(spreadSheetClient.getEditStatus());
  const [userName, setUserName] = useState(window.sessionStorage.getItem('userName') || "");
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isSheetLocked, setisSheetLocked] = useState(() => {
    const storedisSheetLocked = window.sessionStorage.getItem("isSheetLocked");
    return storedisSheetLocked ? storedisSheetLocked === "true" : false;
  });
  const [isMessengerLocked, setisMessengerLocked] = useState(() => {
    const storedisMessengerLocked = window.sessionStorage.getItem("isMessengerLocked");
    return storedisMessengerLocked ? storedisMessengerLocked === "true" : false;
  });
  const [serverSelected, setServerSelected] = useState("localhost");
  const [isAdmin, setIsAdmin] = useState(() => {
    const storedIsAdmin = window.sessionStorage.getItem("isAdmin");
    return storedIsAdmin ? storedIsAdmin === "true" : false;
  });


  function updateDisplayValues(): void {
    spreadSheetClient.userName = userName;
    spreadSheetClient.isSheetLocked = isSheetLocked;
    spreadSheetClient.isMessengerLocked = isMessengerLocked;
    spreadSheetClient.documentName = documentName;
    setFormulaString(spreadSheetClient.getFormulaString());
    setResultString(spreadSheetClient.getResultString());
    setStatusString(spreadSheetClient.getEditStatusString());
    setCells(spreadSheetClient.getSheetDisplayStringsForGUI());
    setCurrentCell(spreadSheetClient.getWorkingCellLabel());
    setCurrentlyEditing(spreadSheetClient.getEditStatus());
    // userObject.isAdmin = isAdmin; // update here
    // send is user is live message here // todo 
    if(userName){pingActive()}
    if(userName){
      let activeUsernamesString =   spreadSheetClient.activeUsers;
      // console.log(activeUsernamesString)
      let userList = activeUsernamesString.split(",").map(u => u.split(":")[0]);
       setActiveUsers(userList);

    }

  }

  // useEffect to refetch the data every 1/20 of a second
  useEffect(() => {
    const interval = setInterval(() => {
      updateDisplayValues();
    }, 50);
    return () => clearInterval(interval);
  });

  function checkPerms(feature: 'messenger' | 'sheet'): boolean {
    if (feature === "sheet") {
        // Allow access if the sheet is not locked or if the user is an admin
        return !isSheetLocked || isAdmin;
    } else if (feature === "messenger") {
        // Allow access if messenger is not locked or if the user is an admin
        return !isMessengerLocked || isAdmin;
    }

    // Optional: return a default value or throw an error for unknown features
    throw new Error("Invalid feature specified");
}


function lockItems() {
  spreadSheetClient.isSheetLockedAdmin(!isSheetLocked!, true)
  setisSheetLocked(spreadSheetClient.isSheetLocked);
  spreadSheetClient.isMessengerLockedAdmin(!isMessengerLocked!, true)
  setisMessengerLocked(spreadSheetClient.isMessengerLocked);

}


function lockSpreadSheet() {
  spreadSheetClient.isSheetLockedAdmin(!isSheetLocked!, true)
  setisSheetLocked(spreadSheetClient.isSheetLocked);

}


function lockMessenger() {
  spreadSheetClient.isMessengerLockedAdmin(!isMessengerLocked!, true)
  setisMessengerLocked(spreadSheetClient.isMessengerLocked);

}

function pingActive() {
  //sends an I'm alive call to the server.
  spreadSheetClient.updateActiveUsers(userName);
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
        isLocked={isSheetLocked}
        onButtonClick={onButtonClick}
          onCommandButtonClick={onCommandButtonClick}
          currentlyEditing={currentlyEditing}></KeyPad>
        <ServerSelector serverSelector={serverSelector} serverSelected={serverSelected} />
        <button onClick={returnToLoginPage} className="returnToLoginButton">Return to Login Page</button>
        <button onClick={lockItems} className="returnToLoginButton">Lock items</button>
        <br />
        <br />
        <div>
            {/* {activeUsers && activeUsers.length > 0 && (
                <div  style={{ border: '1px solid white', listStyleType: 'none', padding: '10px', fontSize: '18px', width: '30%' }}>
                    <p>Active Users</p>
                    <ul>
                        {activeUsers.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>
                </div>
            )} */}
        </div>
      </div>
      {userName && <ChatComponent userName={userName} isLocked={isMessengerLocked}/>}
    </div>

  )
};

export default SpreadSheet;
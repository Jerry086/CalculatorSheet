import React, { useState } from "react";
import Formula from "./Formula";
import Status from "./Status";
import KeyPad from "./KeyPad";
import SpreadSheetEngine from "../Engine/SpreadSheetEngine";
import SheetHolder from "./SheetHolder";

import { ButtonNames } from "../Engine/GlobalDefinitions";


interface CalculatorInputProcessorProps {
  machine: SpreadSheetEngine;
}






// This component is the main component for the calculator



function CalculatorInputProcessor(props: CalculatorInputProcessorProps) {

  const { machine: spreadSheetEngine } = props;
  const [formulaString, setFormulaString] = useState(spreadSheetEngine.getFormulaString())
  const [resultString, setResultString] = useState(spreadSheetEngine.getResultString())
  const [cells, setCells] = useState(spreadSheetEngine.getSheetDisplayStringsForGUI());
  const [statusString, setStatusString] = useState(spreadSheetEngine.getEditStatusString());
  const [currentCell, setCurrentCell] = useState(spreadSheetEngine.getCurrentCellLabel());
  const [currentlyEditing, setCurrentlyEditing] = useState(spreadSheetEngine.getEditStatus());


  function updateDisplayValues(): void {

    setFormulaString(spreadSheetEngine.getFormulaString());
    setResultString(spreadSheetEngine.getResultString());
    setStatusString(spreadSheetEngine.getEditStatusString());
    setCells(spreadSheetEngine.getSheetDisplayStringsForGUI());

    setCurrentCell(spreadSheetEngine.getCurrentCellLabel());
    setCurrentlyEditing(spreadSheetEngine.getEditStatus());
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
  async function onCommandButtonClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    const text = event.currentTarget.textContent;

    if (text) {
      let trueText = text ? text : "";

      switch (trueText) {
        case ButtonNames.edit:
          spreadSheetEngine.setEditStatus(true);
          setStatusString(spreadSheetEngine.getEditStatusString());
          break;

        case ButtonNames.done:
          spreadSheetEngine.setEditStatus(false);
          setStatusString(spreadSheetEngine.getEditStatusString());
          break;

        case ButtonNames.clear:
          spreadSheetEngine.removeToken();
          break;

        case ButtonNames.allClear:
          spreadSheetEngine.clearFormula();
          break;

        case ButtonNames.restart:
          spreadSheetEngine.restart();
          break;

        default:
          await spreadSheetEngine.processCommandButton(trueText);
          break
      }
      // update the display values
      updateDisplayValues();
    }
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

    const text = event.currentTarget.textContent;

    if (text) {
      let trueText = text ? text : "";


      spreadSheetEngine.setEditStatus(true);
      spreadSheetEngine.addToken(trueText);

      updateDisplayValues();
    }
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
    const cellLabel = event.currentTarget.getAttribute("cell-label");
    // calculate the current row and column of the clicked on cell

    const editStatus = spreadSheetEngine.getEditStatus();
    let realCellLabel = cellLabel ? cellLabel : "";


    // if the edit status is true then add the token to the machine
    if (editStatus) {
      spreadSheetEngine.addCell(realCellLabel);  // this will never be ""
      updateDisplayValues();
    }
    // if the edit status is false then set the current cell to the clicked on cell
    else {
      spreadSheetEngine.setCurrentCellByLabel(realCellLabel);
      updateDisplayValues();
    }

  }

  return (
    <div>
      <Formula formulaString={formulaString} resultString={resultString}  ></Formula>
      <Status statusString={statusString}></Status>
      {<SheetHolder cellsValues={cells} onClick={onCellClick} currentCell={currentCell} currentlyEditing={currentlyEditing} ></SheetHolder>}
      <KeyPad onButtonClick={onButtonClick} onCommandButtonClick={onCommandButtonClick}></KeyPad>
    </div>
  )
};

export default CalculatorInputProcessor;
/** SheetMemory Class
 * 
 * This class is used to maintain an 2d array of CellClass objects.
 * 
 * The SheetMemory class is used to store the formulas and values of the cells in the spreadsheet.
 * 
 * The SheetMemory class is used by the Sheet class to store the formulas and values of the cells in the spreadsheet.
 * 
 * The array of cells is private and can only be accessed through the SheetMemory class.
 * 
 * This class provides a way to get and set the cells in the array.
 * 
 * This class calculates a dependency graph of the cells in the spreadsheet.
 * 
 * This class provides a way to evaluate the formulas in the cells.
 * 
 * This class provides a way to get the formulas and values of the cells in the spreadsheet.
 * 
 * This Class provides a way to get and set the current cell.
 * 
 * This class provides a way to evaluate the formula for the current cell. It uses Recalc.ts to evaluate the formula.
 * 
 * 
 * 
 * 
 */

import Cell from "./Cell";

export class SheetMemory {
    private _cells: Cell[][];
    private _numRows: number;
    private _numColumns = 8;

    private _currentRow = 0;
    private _currentColumn = 0;


    constructor(columns: number, rows: number) {

        this._numColumns = columns;
        this._numRows = rows;

        this._cells = [];
        for (let column = 0; column < this._numColumns; column++) {
            this._cells[column] = [];
            for (let row = 0; row < this._numRows; row++) {
                let cell = new Cell();
                cell.setLabel(Cell.columnRowToCell(column, row));
                this._cells[column][row] = cell;
            }
        }
    }

    /**
     * getter for max rows
     * 
     * @returns the max rows
     *  
     * */
    getMaxRows(): number {
        return this._numRows;
    }

    /**
    * getter for max columns
    *   
    * @returns the max columns
    * 
    * */
    getMaxColumns(): number {
        return this._numColumns;
    }


    /**
     *  get coordinates of current cell
     * returns an array of [row, column]
     * */
    getCurrentCellCoordinates(): number[] {
        return [this._currentColumn, this._currentRow];
    }

    /**
     * sets the current cell to be the cell at the coordinates
     * 
     * @param row
     * @param column
     * @param cell
     * */
    setCurrentCellCoordinates(column: number, row: number): void {
        this._currentRow = row;
        this._currentColumn = column;
    }

    /**
     * sets the current cell to be the cell at label
     * 
     * @param label
     * 
     */
    setCurrentCellLabel(label: string): void {
        const [column, row] = Cell.cellToColumnRow(label);
        this.setCurrentCellCoordinates(column, row);
    }

    /**
     * set the current cell
     * 
     * @param cell
     */
    setCurrentCell(cell: Cell): void {
        this._cells[this._currentColumn][this._currentRow] = cell;
    }

    /**
     * get current cell
     * 
     * @returns the value of the current cell
     * 
     * */
    getCurrentCell(): Cell {
        return this._cells[this._currentColumn][this._currentRow];
    }

    /**
     * get cell by label
     * 
     * a label is a string where 
     * the first characters are the column in base 26 
     * and the last characters are the row in base 10
     * 
     * 
     * @param label
     * 
     */

    getCellByLabel(label: string): Cell {
        const [column, row] = Cell.cellToColumnRow(label);

        return this._cells[column][row];
    }

    /**
     * set cell by label
     * 
     * @param label the coordinates of the cell
     * @param cell the cell to set
     */
    setCellByLabel(label: string, cell: Cell): void {
        const [column, row] = Cell.cellToColumnRow(label);
        this._cells[column][row] = cell;
    }

    /**
     * set current cell formula
     *  
     * @param formula
     *  
     * */
    setCurrentCellFormula(formula: FormulaType): void {
        this._cells[this._currentColumn][this._currentRow].setFormula(formula);
    }

    /**
     * 
     * get current cell formula
     * 
     * @returns the formula of the current cell
     * 
     */
    getCurrentCellFormula(): FormulaType {
        return this._cells[this._currentColumn][this._currentRow].getFormula()
    }

    /**
     * set current cell value
     *  
     * @param value
     *  
     * */
    setCurrentCellValue(value: number): void {
        let workingCell: Cell = this._cells[this._currentColumn][this._currentRow];
        workingCell.setValue(value);
    }

    /**
     * Get Sheet formulas
     * 
     * returns a twoD array of formulas
     * 
     * */
    getSheetFormulas(): FormulaType[][] {
        let formulas: FormulaType[][] = [];
        for (let column = 0; column < this._numColumns; column++) {
            formulas[column] = [];
            for (let row = 0; row < this._numRows; row++) {
                formulas[column][row] = this._cells[column][row].getFormula();
            }
        }
        return formulas;
    }

    /**
     * 
     * set sheet formulas
     * 
     * @param formulas
     * 
     */
    setSheetFormulas(formulas: FormulaType[][]): void {
        for (let column = 0; column < this._numColumns; column++) {
            for (let row = 0; row < this._numRows; row++) {
                let cell = new Cell();
                cell.setFormula(formulas[column][row]);
                this._cells[column][row] = cell;
            }
        }


    }

    /**
     * Get Sheet display strings
     * 
     * returns a twoD array of display strings
     */
    getSheetDisplayStrings(): string[][] {
        let displayStrings: string[][] = [];
        for (let column = 0; column < this._numColumns; column++) {
            displayStrings[column] = [];
            for (let row = 0; row < this._numRows; row++) {
                const displayString = this._cells[column][row].getDisplayString();

                displayStrings[column][row] = displayString;


            }
        }
        return displayStrings;
    }


}


export default SheetMemory;
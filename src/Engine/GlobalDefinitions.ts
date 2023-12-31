export const ErrorMessages = {
  partial: "#ERR",
  divideByZero: "#DIV/0!",
  invalidCell: "#REF!",
  invalidFormula: "#ERR",
  invalidNumber: "#ERR",
  invalidOperator: "#ERR",
  missingParentheses: "#ERR",
  emptyFormula: "#EMPTY!", // this is not an error message but we use it to indicate that the cell is empty
};

export const ButtonNames = {
  edit_toggle: "edit-toggle",
  edit: "edit",
  done: "=",
  allClear: "AC",
  clear: "C",
};

export interface CellTransport {
  formula: string[];
  value: number;
  error: string;
  editing: string;
}

export interface UserEditing {
  user: string;
  cell: string;
}

export interface CellTransportMap {
  [key: string]: CellTransport;
}

export interface DocumentTransport {
  columns: number;
  rows: number;
  cells: Map<string, CellTransport>;
  formula: string;
  result: string;
  currentCell: string;
  isEditing: boolean;
  contributingUsers: UserEditing[];
  errorMessage: string;
  // locked users
  lockedSheetUsers: string[];
}

// message container

export interface MessageContainer {
  user: string;
  message: string;
  timestamp: Date;
  id: number;
}

export interface MessagesContainer {
  messages: MessageContainer[];
  paginationToken: string;
  // locked users
  lockedChat: boolean;
  lockedChatUsers: string[];
  error: string;
}

// user container
export interface UserContainer {
  user: string;
  isAdmin: boolean;
  group: number;
}

export interface UsersContainer {
  users: UserContainer[];
  error: string;
}

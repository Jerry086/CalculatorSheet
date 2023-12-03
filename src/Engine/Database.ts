/**
 * Database of chat messages and users
 *
 * @class Database
 */

import * as fs from "fs";
import * as path from "path";
import { MessagesContainer, MessageContainer } from "./GlobalDefinitions";

class Message implements MessageContainer {
  /**
   * The message text
   *
   * @private
   * @type {string}
   * @memberof Message
   */
  message: string;
  /**
   * The user who sent the message
   *
   * @private
   * @type {string}
   * @memberof Message
   */
  user: string;
  /**
   * The timestamp of the message
   *
   * @private
   * @type {Date}
   * @memberof Message
   */
  timestamp: Date;
  /**
   * the id of the message
   * @param {number} id
   * @memberof Message
   *
   * */
  id: number = 0;
  /**
   * Creates an instance of Message.
   * @param {string} text
   * @param {User} user
   * @memberof Message
   */

  constructor(text: string, user: string, id: number) {
    this.message = text;
    this.user = user;
    this.timestamp = new Date();
    this.id = id;
  }

  /**
   * Creates a Message instance from a JSON object.
   * @static
   * @param {any} json - The JSON object representing the message.
   * @returns {Message} - The instance created from the JSON object.
   */
  static fromJSON(json: any): Message {
    const message = new Message(json.message, json.user, json.id);
    // Restore timestamp from ISO string
    message.timestamp = new Date(json.timestamp);
    return message;
  }
  /**
   * Convers the Message instance to a JSON object.
   * @returns {any} - The JSON object representing the message.
   */
  toJSON(): any {
    return {
      message: this.message,
      user: this.user,
      id: this.id,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

class Database {
  /**
   * Array of chat messages
   *
   * @private
   * @type {Message[]}
   * @memberof Database
   */
  private messages: Message[] = [];
  private messageCount: number = 0;
  private lockedChat: boolean = false;
  private lockedChatUsers: string[] = [];
  private error: string = "";
  private filePath: string = path.join(
    __dirname,
    "..",
    "..",
    "chathistory",
    "database.json"
  );

  /**
   * Creates an instance of Database.
   * @memberof Database
   */
  constructor() {
    this.messages = [];
    this.messageCount = 0;
    this.lockedChatUsers = [];
    this.error = "";
    // Load database from file if it exists
    this.loadDatabaseFile();
  }

  reset() {
    this.messages = [];
    this.messageCount = 0;
    this.lockedChat = false;
    this.lockedChatUsers = [];
    this.error = "";
  }

  /**
   * Save the database to a json file.
   * @memberof Database
   *
   */
  saveDatabaseFile() {
    const data = JSON.stringify(
      this.messages.map((message) => message.toJSON()),
      null,
      2
    );

    try {
      const directoryPath = path.join(__dirname, "chathistory");
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
      }

      fs.writeFileSync(this.filePath, data);
      console.log("Database saved successfully.");
    } catch (error) {
      console.error("Error saving database:", error);
    }
  }

  /**
   * Load the database from a json file.
   * @memberof Database
   *
   */
  loadDatabaseFile() {
    try {
      const data = fs.readFileSync(this.filePath, "utf-8");
      const jsonMessages = JSON.parse(data);

      this.messages = jsonMessages.map((jsonMessage: any) =>
        Message.fromJSON(jsonMessage)
      );
      this.messageCount = this.messages.length;

      console.log("Database loaded successfully.");
    } catch (error: any) {
      // If the file does not exist, ignore the error (first run or file got deleted)
      if (error.code !== "ENOENT") {
        console.error("Error loading database:", error);
      }
    }
  }

  /**
   * Add a message to the database
   *
   * @param {Message} message
   * @memberof Database
   */
  addMessage(user: string, message: string) {
    // send error if user is locked
    if (this.lockedChat || this.lockedChatUsers.includes(user)) {
      this.error = `${user} does not have permission to send messages`;
      return;
    }
    // prepend the message to the array
    this.messages.unshift(new Message(message, user, this.messageCount++));
    // save the database to a file
    this.saveDatabaseFile();
    console.log("added message,", message);
  }

  // get all messages  this is for testing only, do not use in production
  getAllMessages(): MessagesContainer {
    const result: MessagesContainer = {
      messages: this.messages,
      paginationToken: "__TEST_DISABLE_IN_PRODUCTION__",
      error: this.error,
      lockedChat: this.lockedChat,
      lockedChatUsers: this.lockedChatUsers,
    };

    return result;
  }

  /**
   * Get all messages paged by 20
   *
   * @returns {Message[]}
   * @memberof Database
   */
  getMessages(pagingToken: string): MessagesContainer {
    let result: MessagesContainer = {
      messages: [],
      paginationToken: "",
      error: this.error,
      lockedChat: this.lockedChat,
      lockedChatUsers: this.lockedChatUsers,
    };
    this.error = "";
    // if paging token is "__END__" then send empty array and "__END__"
    if (pagingToken === "__END__") {
      result.paginationToken = "__END__";
      return result;
    }

    // if less than paging size then send message and "__END__"
    if (this.messages.length <= 20 && pagingToken === "") {
      result.messages = this.messages;
      result.paginationToken = "__END__";
      return result;
    }

    if (pagingToken === "") {
      // generate Unique ID for this user that contains the message id of the next message to be sent
      // get the ten messages to send (the last ones)
      const messagesToSend = this.messages.slice(0, 20);

      // get the id of the next message in the array right now
      const nextMessageId = this.messages[20].id;
      const paginationToken = `__${nextMessageId
        .toString()
        .padStart(10, "0")}__`;
      result.messages = messagesToSend;
      result.paginationToken = paginationToken;
      return result;
    }

    // get rid of the __ at the beginning and end of the token
    pagingToken = pagingToken.substring(2, pagingToken.length - 2);
    // get the next message id from the token
    let nextMessageId = parseInt(pagingToken);
    // get the index of the next message
    const nextMessageIndex = this.messages.findIndex(
      (message) => message.id === nextMessageId
    );
    // if the next message is not found, then return empty array and "__END__"
    if (nextMessageIndex === -1) {
      result.paginationToken = "__END__";
      result.error = `Message with id ${nextMessageId} not found`;
      return result;
    }

    // At this point we know we have some messages to send.
    // Does it include the last message, if so then send "__END__" as the token
    const messagesToSend = this.messages.slice(
      nextMessageIndex,
      nextMessageIndex + 20
    );
    if (nextMessageIndex + 20 >= this.messages.length) {
      result.messages = messagesToSend;
      result.paginationToken = "__END__";
      return result;
    }

    nextMessageId = this.messages[nextMessageIndex + 20].id;
    // generate Unique ID for this user that contains the message id of the next message to be sent
    let paginationToken = `__${nextMessageId.toString().padStart(10, "0")}__`;
    result.messages = messagesToSend;
    result.paginationToken = paginationToken;
    return result;
  }

  /**
   * Lock a user from sending messages
   *
   * @param {string} user
   * @memberof Database
   */
  lockUser(user: string) {
    this.lockedChat = true;
    // find if the user is already locked
    const index = this.lockedChatUsers.findIndex((u) => u === user);
    if (index === -1) {
      // add the user
      this.lockedChatUsers.push(user);
      console.log("locked user,", user);
    }
  }

  /**
   * locks a collection of users from sending messages
   * @param {string[]} users
   * @memberof Database
   * */
  lockUsers(users: string[]) {
    this.lockedChat = true;
    users.forEach((user) => {
      // find if the user is already locked
      const index = this.lockedChatUsers.findIndex((u) => u === user);
      if (index === -1) {
        // add the user
        this.lockedChatUsers.push(user);
        console.log("locked user,", user);
      }
    });
  }

  /**
   * Unlock a user from sending messages
   *
   * @param {string} user
   * @memberof Database
   */
  unlockUser(user: string) {
    // find if the user is already locked
    const index = this.lockedChatUsers.findIndex((u) => u === user);
    if (index !== -1) {
      // remove the user
      this.lockedChatUsers.splice(index, 1);
      console.log("unlocked user,", user);
    }
    if (this.lockedChatUsers.length === 0) {
      this.lockedChat = false;
    }
  }

  /**
   * unlocks a collection of users from sending messages
   * @param {string[]} users
   * @memberof Database
   * */
  unlockUsers(users: string[]) {
    users.forEach((user) => {
      // find if the user is already locked
      const index = this.lockedChatUsers.findIndex((u) => u === user);
      if (index !== -1) {
        // remove the user
        this.lockedChatUsers.splice(index, 1);
        console.log("unlocked user,", user);
      }
    });
    if (this.lockedChatUsers.length === 0) {
      this.lockedChat = false;
    }
  }

  /**
   * unlock all users from sending messages
   * @memberof Database
   * */
  unlockAllUsers() {
    this.lockedChat = false;
    this.lockedChatUsers = [];
    console.log("unlocked all users");
  }
}
export { Database, Message };

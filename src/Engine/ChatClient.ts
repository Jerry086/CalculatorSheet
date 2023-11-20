/** this is the class for the front end to prepare the fetch
 * requests to the server for the chat messages
 *
 * it is used by chatComponent.tsx
 *
 * It provides the following calls.
 *
 */

import { MessagesContainer, MessageContainer } from "./GlobalDefinitions";
import {
  PortsGlobal,
  LOCAL_SERVER_URL,
  RENDER_SERVER_URL,
} from "../ServerDataDefinitions";

class ChatClient {
  private _serverPort: number = PortsGlobal.serverPort;
  private _baseURL: string = `${LOCAL_SERVER_URL}:${this._serverPort}`;
  private _server: string = "";
  earliestMessageID: number = 10000000000;
  previousMessagesFetched: boolean = false;

  messages: MessageContainer[] = [];

  updateDisplay: () => void = () => {};

  /**
   * Creates an instance of ChatClient.
   * @memberof ChatClient
   */
  constructor() {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      this.setServerSelector("renderhost");
    } else {
      this.setServerSelector("localhost"); // change this to renderhost if you want to default to renderhost
    }

    this.getMessages();
    this.getMessagesContinuously();
  }

  setCallback(callback: () => void) {
    this.updateDisplay = callback;
  }

  /**
   * insert a message into the array of messages
   * @param message a message to insert into the array of messages
   */
  insertMessage(message: MessageContainer) {
    const messageID = message.id;

    if (this.earliestMessageID > messageID) {
      this.earliestMessageID = messageID;
    }

    if (this.messages.length === 0) {
      this.messages.push(message);
      console.log(`inserted message ${messageID} into empty array`);
      return;
    }

    if (messageID > this.messages[0].id) {
      this.messages.unshift(message);
      console.log(
        `inserted message ${messageID} at the beginning of the array`
      );

      return;
    }

    if (messageID < this.messages[this.messages.length - 1].id) {
      this.messages.push(message);
      console.log(`inserted message ${messageID} at the end of the array`);
      this.previousMessagesFetched = true;

      return;
    }
  }

  /**
   * insert an array of messages into the message cache
   * @param messages an array of messages to insert into the message cache
   */
  insertMessages(messages: MessageContainer[]) {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      this.insertMessage(message);
    }
    this.updateDisplay();
  }

  /**
   * get the latest 20 messages from the server if the paging token is empty
   * get the older 20 messages from the server if the paging token is not empty
   */
  getMessages(pagingToken: string = "") {
    const url = `${this._baseURL}/messages/get/`;

    const fetchURL = `${url}${pagingToken}`;
    fetch(fetchURL)
      .then((response) => response.json())
      .then((messagesContainer: MessagesContainer) => {
        let messages = messagesContainer.messages;
        if (messages.length === 0) {
          return;
        }
        this.insertMessages(messages);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * get the messages once a second
   */
  getMessagesContinuously() {
    // console.log("getMessagesContinuously()");
    setInterval(() => {
      this.getMessages();
    }, 1000);
  }

  /**
   * Advanced topic: get the next 20 messages
   * this method is called when the user scrolls to the top of the chat window
   * or click the "Load Previous Messages" button
   */
  getNextMessages() {
    console.log("getNextMessages()");
    console.log(`this.earliestMessageID: ${this.earliestMessageID - 1}`);
    const nextMessageToFetch = this.earliestMessageID - 1;
    const pagingToken = `__${nextMessageToFetch
      .toString()
      .padStart(10, "0")}__`;
    this.getMessages(pagingToken);
  }

  /**
   * send a message to the server via POST
   * @param message a message to send to the server
   * @param user the user who sent the message
   */
  sendMessagePost(message: string, user: string) {
    console.log("sendMessage()");

    const url = `${this._baseURL}/message`;

    const data = {
      user: user,
      message: message,
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((messagesContainer: MessagesContainer) => {
        let messages = messagesContainer.messages;
        this.insertMessages(messages);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * Server selector for the fetch
   */
  setServerSelector(server: string): void {
    if (server === this._server) {
      return;
    }
    if (server === "localhost") {
      this._baseURL = `${LOCAL_SERVER_URL}:${this._serverPort}`;
    } else {
      this._baseURL = RENDER_SERVER_URL;
    }
    this._server = server;
  }
}

export default ChatClient;

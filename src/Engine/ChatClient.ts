/**
 * ChatClient
 *
 * @export
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
  earliestMessageID: number = 10000000000;
  previousMessagesFetched: boolean = false;

  messages: MessageContainer[] = [];

  updateDisplay: () => void = () => {};

  /**
   * Creates an instance of ChatClient.
   * @memberof ChatClient
   */
  constructor() {
    console.log("ChatClient");
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
    // console.log(`Message is not inserted ${messageID}`)
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
    //const url = `https://pagination-demo.onrender.com/messages/get`

    const fetchURL = `${url}${pagingToken}`;
    fetch(fetchURL)
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
   * get the messages once a second
   */
  getMessagesContinuously() {
    console.log("getMessagesContinuously()");
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
   * send a message to the server
   * @param message a message to send to the server
   * @param user the user who sent the message
   */
  sendMessage(message: string, user: string) {
    console.log("sentMessage()");
    const url = `${this._baseURL}/message/${user}/${message}`;
    //const url = `https://pagination-demo.onrender.com/message/${user}/${message}`

    fetch(url)
      .then((response) => response.json())
      .then((messagesContainer: MessagesContainer) => {
        let messages = messagesContainer.messages;
        this.insertMessages(messages);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

export default ChatClient;
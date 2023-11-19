import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ChatComponent.css"; // Import the CSS file
import { MessageContainer } from "../Engine/GlobalDefinitions";
import ChatClient from "../Engine/ChatClient";



interface ChatComponentProps {
  userName: string;
}



const chatClient = new ChatClient();

const ChatComponent: React.FC<ChatComponentProps> = ({ userName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loadingPrevMessages, setLoadingPrevMessages] = useState(false);
  const [messageList, setMessageList] = useState<MessageContainer[]>([]);
  const [mostRecentId, setMostRecentId] = useState<number>(-1);
  const messageListRef = useRef<HTMLUListElement>(null);

  const updateDisplay = useCallback(() => {
    let updateNeeded = false;
    const newLastId = chatClient.messages[0].id;
    if (newLastId !== mostRecentId) {
      updateNeeded = true;
    }
    if (chatClient.previousMessagesFetched) {
      updateNeeded = true;
      chatClient.previousMessagesFetched = false;
    }
    if (!updateNeeded) {
      return;
    }

    let newMessages = [...chatClient.messages];

    setMessageList(newMessages);
    setMostRecentId(newLastId);
  }, [mostRecentId, messageList]);

  useEffect(() => {
    chatClient.setCallback(updateDisplay);
  }, [updateDisplay]);

  const isCurrentUser = (messageUsername: string) => {
    return userName === messageUsername;
  };

  // START at bottom of messages
  // scroll to bottom when new message is added
  useEffect(() => {
    scrollToBottom();
    // const intervalId = setInterval(getNewMessages, 3000); // Fetch new messages every 3 seconds
    // return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, [mostRecentId]);

  

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const topReached = e.currentTarget.scrollTop === 0;
    if (topReached && !loadingPrevMessages) {
      // getPrevMessages();
      chatClient.getNextMessages();
    }
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const originalValue = e.target.value;

      // Check if the input is empty and not just a sequence of whitespaces
    if (originalValue.trim() === "") {
      alert("Input cannot be empty.");
      return;
    }
    
    const regex = /[^a-z0-9.,!?\\/\-_()\s=+*&^%$#@!~:;<>'"{[\]}]/gi; // Matches characters NOT in the set
    const newValue = originalValue.replace(regex, '');

    const numInvalidChars = originalValue.length - newValue.length;

    if (numInvalidChars > 0) {
        alert(`${numInvalidChars} invalid character(s) removed.`);
    }

    setInputValue(newValue);
};



  const handleSendMessage = () => {
    if (inputValue.length < 1) {
      console.log("Error: message cannot be empty");
    } else {
      // chatClient.sendMessage(inputValue, userName);
      chatClient.sendMessagePost(inputValue, userName);

      // alert(inputValue);
      setInputValue(""); // Clear the input field after sending the message
    }
  };

  return (
    <div className="chat-container">
      <div className={`button-row  ${isCollapsed ? "hidden-button" : "shown-button"}`} onClick={toggleCollapse}>
        <span className="button-text">{isCollapsed ? "+" : "-"}</span>
      </div>

      {!isCollapsed && (
        <>
          <ul className="chat-message-list" onScroll={handleScroll} ref={messageListRef}>
            {[...messageList].reverse().map((message, index) => (
              <li
                key={index}
                className={`chat-message ${isCurrentUser(message.user) ? "user-message" : "other-message"}`}
                title={message.timestamp.toString()}
              >
                <strong className={` ${isCurrentUser(message.user) ? "userTitleSelf" : "userTitleOther"}`}>
                  {message.user}
                </strong>
                {message.message}
              </li>
            ))}
          </ul>

          <div className="input-area">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyUp={(event) => {
                if (event.key === "Enter" && !event.ctrlKey) {
                  event.preventDefault(); // Prevent default behavior of Enter key
                  handleSendMessage();
                } else if (event.key === "Enter" && event.ctrlKey) {
                  // Allow new line on Ctrl+Enter
                  setInputValue((prevValue) => prevValue + "\n");
                }
              }}
              className="chat-textarea"
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage} className="send-button">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatComponent;

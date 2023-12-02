import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ChatComponent.css"; // Import the CSS file
import { MessageContainer } from "../Engine/GlobalDefinitions";
import ChatClient from "../Engine/ChatClient";



interface ChatComponentProps {
  userName: string;
  chatClient: ChatClient;
  isLocked:boolean;

}

const ChatComponent: React.FC<ChatComponentProps> = ({ userName, chatClient, isLocked
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
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

  // scroll to bottom when new message is added
  useEffect(() => {
    scrollToBottom();
  }, [mostRecentId]);

  
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const topReached = e.currentTarget.scrollTop === 0;
    if (topReached) {
      chatClient.getNextMessages();
    }
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const originalValue = e.target.value;

    // Check moved to send message function.
    // Check if the input is empty and not just a sequence of whitespaces
    // if (originalValue.trim() === "") {
    //   alert("Input cannot be empty.");
    //   return;
    // }
    
    const regex = /[^a-z0-9.,!?\\/\-_()\s=+*&^%$#@!~:;<>'"{[\]}]/gi; // Matches characters NOT in the set
    const newValue = originalValue.replace(regex, '');

    const numInvalidChars = originalValue.length - newValue.length;

    if (numInvalidChars > 0) {
        alert(`${numInvalidChars} invalid character(s) removed.`);
    }

    setInputValue(newValue);
};



  const handleSendMessage = () => {
    if (inputValue.trim() === "") {
      console.log("Error: message cannot be empty");
      alert("Error: Input cannot be empty.");
    } else {
      // chatClient.sendMessage(inputValue, userName);
      chatClient.sendMessagePost(inputValue, userName);
      setInputValue(""); // Clear the input field after sending the message
    }
  };

  return (
    <div className="chat-container">
      <div className={`button-row  ${isCollapsed ? "hidden-button" : "shown-button"}`} onClick={toggleCollapse}>
        <span className="button-text">{isCollapsed ? "+" : "-"}</span>
      </div>

      {!isCollapsed && (
        <div className={` ${isLocked ? "disabled-chat" : "enabled-chat"}`}> 
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
             
              readOnly={isLocked} 

              value={inputValue}
              onChange={handleInputChange}
              onKeyUp={(event) => {
                if (isLocked) {
                  return;
                }
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
            <button onClick={handleSendMessage}   disabled={isLocked} className="send-button">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;

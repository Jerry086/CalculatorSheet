import React, { useState, useEffect, useRef } from "react";
import "./ChatComponent.css"; // Import the CSS file

interface Message {
  // TODO oldest message should be a termination message - no more messages
  text: string;
  username: string;
  timestamp: string;
}

interface ChatComponentProps {
  messages: Message[];
  userName: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ messages, userName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loadingPrevMessages, setLoadingPrevMessages] = useState(false);
  const [messageList, setMessageList] = useState(messages);
  const messageListRef = useRef<HTMLUListElement>(null);

  const isCurrentUser = (messageUsername: string) => {
    return userName === messageUsername;
  };

  // START at bottom of messages
  useEffect(() => {
    scrollToBottom();
    const intervalId = setInterval(getNewMessages, 3000); // Fetch new messages every 3 seconds
    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  const getNewMessages = async () => {
    try {
      // Simulate a network request to fetch new messages
      // TODO LOGIC HERE NEEDED
      const fetchedMessages: Message[] = await fetchMessagesFromServer();

      // Filter for new unique messages
      const newMessages = fetchedMessages.filter(
        (fetchedMsg) => !messageList.some((existingMsg) => existingMsg.timestamp === fetchedMsg.timestamp)
      );

      // Sort new messages by their time values
      // INCASE NOT ORDERED
      newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      if (newMessages.length > 0) {
        setMessageList([...messageList, ...newMessages]); // Append new messages
      }
    } catch (error) {
      console.error("Error fetching new messages:", error);
    }
  };

  // Detect when we reach the top
  // TODO - doesn't handle removing messages when adding new ones? this okay?
  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const topReached = e.currentTarget.scrollTop === 0;
    if (topReached && !loadingPrevMessages) {
      getPrevMessages();
    }
  };

  const getPrevMessages = () => {
    setLoadingPrevMessages(true); // Prevents multiple calls
    console.log("Fetching previous messages...");

    // Simulate a network request
    //TODO ACTUAL LOGIC INSTEAD
    setTimeout(() => {
      const newMessages = [
        {
          text: "New message 1",
          username: "Alice",
          timestamp: "Dec 8 10:10:10 am",
        },
        {
          text: "New message 2",
          username: "Bob",
          timestamp: "Dec 8 10:10:20 am",
        },
        {
          text: "New message 3",
          username: "Charlie",
          timestamp: "Dec 8 10:10:30 am",
        },
      ];

      // Filter out duplicates
      const updatedMessages = newMessages.filter(
        (newMsg) =>
          !messageList.some(
            (msg) => msg.text === newMsg.text && msg.username === newMsg.username && msg.timestamp === newMsg.timestamp
          )
      );

      setMessageList([...updatedMessages, ...messageList]); // Prepend new messages
      setLoadingPrevMessages(false);
    }, 2000); // Simulate a delay of 2 seconds
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.length < 1) {
      console.log("Error: message cannot be empty");
    } else {
      const currentTime = new Date();
      const formattedTime = currentTime.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      console.log("Message sent:", inputValue, "Time:", formattedTime, "Message sender:", userName);

      // TODO Implement the logic to send a message - use console as an example

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
            {messageList.map((message, index) => (
              <li
                key={index}
                className={`chat-message ${isCurrentUser(message.username) ? "user-message" : "other-message"}`}
                title={message.timestamp}
              >
                <strong className={` ${isCurrentUser(message.username) ? "userTitleSelf" : "userTitleOther"}`}>
                  {message.username && message.username}
                </strong>
                {message.text}
              </li>
            ))}
          </ul>

          <div className="input-area">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
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

let initialFetchDone = false;

async function fetchMessagesFromServer(): Promise<Message[]> {
  // Simulate a 3-second delay only on the first fetch
  if (!initialFetchDone) {
    await new Promise((resolve) => setTimeout(resolve, 3333));
    initialFetchDone = true;
  }

  const dummyMessages: Message[] = [
    {
      text: "New Dummy message 1",
      username: "Alice",
      timestamp: "Dec 8 2020 10:10:30 am",
    },
    {
      text: "New Dummy message 2",
      username: "Sam",
      timestamp: "Dec 8 2026 10:10:30 am",
    },
    {
      text: "New Dummy message 3",
      username: "Charlie",
      timestamp: "Dec 8 2022 10:10:30 am",
    },
    {
      text: "New Dummy message 4",
      username: "Dana",
      timestamp: "Dec 8 2021 10:10:30 am",
    },
  ];

  return dummyMessages;
}
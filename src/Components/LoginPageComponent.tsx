import React, { useState, useEffect } from 'react';
import './LoginPageComponent.css';
import './loginPageOnlyCSS.css';
import bcrypt from 'bcryptjs';
import ChatClient from '../Engine/ChatClient';
import { UsersContainer } from '../Engine/GlobalDefinitions';


/**
 * Login PageComponent is the component that will be used to display the login page
 * If the user is logged in, then this component will display the list of documents
 * that the user has access to.  Each document will have a button that will allow the
 * user to edit the document. when the user clicks on the button, the user will be
 * taken to the document page.
 * @returns 
 */

import SpreadSheetClient from '../Engine/SpreadSheetClient';
import { spread } from 'axios';

interface LoginPageProps {
  spreadSheetClient: SpreadSheetClient;
  chatClient: ChatClient;
}
interface LoginResponse {
  username: string;
  isAdmin: boolean;
  isAdminKey?: string;
}

interface LoginError {
  error: string;
}

interface SheetData {
  isUnlocked: boolean;
  activeUsers: string[];
}

interface SheetsDataType {
  [key: string]: SheetData;
}

// const chatClientInstance = new ChatClient();
// const baseUrl = chatClientInstance.getBaseURL();

function  LoginPageComponent({ spreadSheetClient, chatClient }: LoginPageProps): JSX.Element {
  const [userName, setUserName] = useState(window.sessionStorage.getItem('userName') || "");
  const [isAdmin, setIsAdmin] = useState(window.sessionStorage.getItem('isAdmin') === 'true');
  const [isAdminKey, setIsAdminKey] = useState(window.sessionStorage.getItem('isAdminKey') || "");
  const [documents, setDocuments] = useState<string[]>([]);
  const [sheetsData, setSheetsData] = useState<SheetsDataType>({});
  const [usersContainer, setusersContainer] = useState<UsersContainer>();
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string[]>([]);

  const baseUrl = spreadSheetClient.getBaseURL();
  



  // SpreadSheetClient is fetching the documents from the server so we should
  // check every 1/20 of a second to see if the documents have been fetched
  useEffect(() => {
    const interval = setInterval(() => {
      const sheets = spreadSheetClient.getSheets();
      const data = spreadSheetClient.getSheetsProps();
      const sheetData: SheetsDataType = {};
      data.forEach((sheet) => {
        sheetData[sheet.documentName] = { isUnlocked: sheet.isUnlocked, activeUsers: sheet.activeUsers };
      })
      setSheetsData(sheetData);
      if (sheets.length > 0) {
        setDocuments(sheets);
      }
    }, 50);
    return () => clearInterval(interval);
  });

  // creates toolbar for admin users -TODO
  function buildToolbar() {
    return (
      <div className="toolbar">
        <button onClick={handleLockSheets}>Lock All</button> 
        <button onClick={handleUnlockSheets}>Unlock All</button> 
        <button onClick={handleMuteChat}>Mute Chat</button>
        <button onClick={handleUnmuteChat}>Unmute Chat</button>
      </div>
    );
  }


  async function handleLockSheets() {
    for (const sheetName in sheetsData) {
      if (sheetsData.hasOwnProperty(sheetName)) {
        const sheet = sheetsData[sheetName];
        if (!sheet.isUnlocked) {
          // send request to backend to lock sheet
          try {
            const response = await fetch(`${baseUrl}/document/lock/${sheetName}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ admin: userName }),
            });
      
            if (response.ok) {
              console.log("%s unlocked", sheetName);
            } else {
              throw new Error(`Error locking sheets: ${response.status}`);
            }
          } catch (error) {
            // Handle any errors that occurred during the backend calls
            return { error: "Lock sheets error: " + (error instanceof Error ? error.message : "Unknown error") };
          }
        } else {
          // do nothing
        }
      }
    }
  }

  async function handleUnlockSheets() {
    for (const sheetName in sheetsData) {
      if (sheetsData.hasOwnProperty(sheetName)) {
        const sheet = sheetsData[sheetName];
        if (sheet.isUnlocked) {
          // send request to backend to unlock sheet
          try {
            const response = await fetch(`${baseUrl}/document/unlock/${sheetName}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ admin: userName }),
            });
      
            if (response.ok) {
              console.log("%s unlocked", sheetName);
            } else {
              throw new Error(`Error locking sheets: ${response.status}`);
            }
          } catch (error) {
            // Handle any errors that occurred during the backend calls
            return { error: "Lock sheets error: " + (error instanceof Error ? error.message : "Unknown error") };
          }
        } else {
          // do nothing
        }
      }
    }
  }


  async function handleMuteChat() {
      const res = chatClient.muteAllUsers(userName);
      res.then((res) => {
        if (res) {
          setIsChatLocked(true);
          console.log("chat locked");
        } else{
          alert(`Error muting chat`);
        }
      })
  }

  async function handleUnmuteChat() {
    const res = chatClient.unmuteAllUsers(userName);
    res.then((res) => {
      if (res) {
        setIsChatLocked(false);
        console.log("chat unlocked");
      } else{
        alert(`Error muting chat`);
      }
    })
  }
    
// fetches extra info for admin users -TODO
  function dummyGetSpreadSheetData(sheets: string[]): SheetsDataType {
    const data: SheetsDataType = {};
  
    // Specific sheets to modify - dummy data 
    // replace with call to backend with isAdminKey
    // specificSheets contains the name of locked sheets
    const specificSheets = ['test1', 'test10.1', 'test10', 'test11', 'test12', 'test13'];
    let index = 1;
  
    sheets.forEach(sheet => {
      if (specificSheets.includes(sheet)) {
        // For specific sheets, set isUnlocked to false and add fake usernames
        data[sheet] = {
          isUnlocked: false,
          // TODO: Replace with actual active users
          activeUsers: Array.from({ length: index++ }, (_, i) => `user${i + 1}`)
        };
      } else if (!data[sheet]) {
        // For other sheets, retain existing logic
        data[sheet] = { isUnlocked: true, activeUsers: [] };
      }
    });
    
    return data;
  }
    
  // dummy function to set new state for sheets todo
  function dummyToggleLockStatus(sheetName: string , newStatus: boolean, isAdminKey: string) {
      // Simulate toggling the lock status
      // This should be replaced with a real server call
    }
    

    // old function to try and log in - used for normal users
    function getUserLogin() {
    return <div>
      <input
        id="userNameInput"
        type="text"
        placeholder="User name"
        defaultValue={userName}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            // get the text from the input
            // let userName = (event.target as HTMLInputElement).value;
            // window.sessionStorage.setItem('userName', userName);
            // // set the user name
            // setUserName(userName);
            // spreadSheetClient.userName = userName;
            handleLogin();

          }
        }} />
    </div>

  }

  // Fuction to get all active users
  async function getActiveUsers() {
    try {
      // Simulate a backend request (replace with actual fetch or axios call)
      //const chatClientInstance = new ChatClient();
      //const baseUrl = chatClientInstance.getBaseURL();
      const response = await fetch(`${baseUrl}/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const usersContainer: UsersContainer = await response.json();
        setusersContainer(usersContainer);
        console.log(JSON.stringify(usersContainer));
        return usersContainer;
        // return true;
      } else {
        throw new Error(`Error fetching users: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching users");
    }
  }
      


  // Function to register a user (replace with actual backend implementation)
  async function registerUser(userName: string): Promise<boolean> {
    // Simulate a backend request (replace with actual fetch or axios call)
    //const chatClientInstance = new ChatClient();
    //const baseUrl = chatClientInstance.getBaseURL();
    const response = await fetch(`${baseUrl}/user/${userName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName: userName }),
    });
    const responseText = await response.text();
    if (response.status === 200) {
      return true;
    } else {
      return false;
      //return { error: "Backend error: " + responseText };
    }
  }

  //updated login funtion - for admin name request login info
  // need to write back end and way to set admin names todo
  async function handleLogin() {
    const userNameInput = document.querySelector('#userNameInput') as HTMLInputElement;
  
    if (checkUserNameInput()) { //is username not blank
      const userName = userNameInput.value;
      if (!checkUserName(userName)) { // if username matches regex 
        return;
      }

      try {
      // first register user, the promote Admin user.
      const registerUserResponse = await registerUser(userName);
      //const loginResponse = dummyLoginCall(userName);
      const loginResponse = await loginCall(userName);
    
    // TODO

      if ('error' in loginResponse) {
        alert(loginResponse.error);
        return;
      }
  
      window.sessionStorage.setItem('userName', loginResponse.username);
      window.sessionStorage.setItem('isAdmin', loginResponse.isAdmin.toString());
      /*
      if (loginResponse.isAdmin && loginResponse.isAdminKey) {
        window.sessionStorage.setItem('isAdminKey', loginResponse.isAdminKey!);
      }
      */
  
      setUserName(loginResponse.username);
      setIsAdmin(loginResponse.isAdmin);
      /*
      if (loginResponse.isAdminKey) {
        setIsAdminKey(loginResponse.isAdminKey);
      }
      */
      spreadSheetClient.userName = loginResponse.username;
      } catch (error) {
        // Handle any errors that occurred during the backend calls
        return { error: "Login error: " + (error instanceof Error ? error.message : "Unknown error") };
      }
  
      
    }
  }
  

  
  //updated login funtion handler - for admin name request login info
  // need to write back end and way to set admin names todo
  function dummyLoginCall(userName: string): LoginResponse | LoginError {
    if (userName === "Admin") { // call to server, check if admin user
      const password = prompt("Please enter your password");
      // check if password is not blank
      if (password != null) {
        console.log("password is " + password);
        // encrypt password using SHA256

        // send password to backend to check if correct

        // get if correct info from backend

      }

      if (password === "password") { // call to server to authenticate - encrypt this
        return { username: "Admin", isAdmin: true, isAdminKey: "secretKey" }; // secretKey should be encrypted token
      } else {
        return { error: "Wrong password" };
      }
    } else {
      return { username: userName, isAdmin: false };
    }
  }


// Function to check if the password is correct (replace with actual backend implementation)
async function backendCheckPassword(userName: string, encryptedPassword: string): Promise<boolean> {
  // Simulate a backend request (replace with actual fetch or axios call)
  //const chatClientInstance = new ChatClient();
  //const baseUrl = chatClientInstance.getBaseURL();
  const response = await fetch(`${baseUrl}/user/promote`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userName: userName, password: encryptedPassword }),
  });
  //console.log(encryptedPassword);

  // Assuming the backend returns a JSON object with a 'isPasswordCorrect' property
  //const result = await response.json();
  
  const responseText = await response.text();
  //console.log(responseText);
  //const contentType = response.headers.get('Content-Type');
  //console.log(contentType);
  // if the response is 200 then the password is correct
  // if the response is error then the password is incorrect
  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
}

async function hashPassword(password: string) {
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    //console.log('Hash to store:', hash);
    return hash;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

// Function to initiate the login process
async function loginCall(userName: string): Promise<LoginResponse | LoginError> {
  if (userName === "Admin") {
    const password = prompt("Please enter your password");

    if (password != null && password !== "") {
      //console.log("password is " + password);

        const encryptedPassword = await hashPassword(password)

        try {
          // Send encrypted password to backend to check if correct
          const isPasswordCorrect = await backendCheckPassword(userName, encryptedPassword);

          if (isPasswordCorrect) {
            return { username: userName, isAdmin: true };
          } else {
            // Return an error for wrong password
            return { error: "Wrong password" };
          }
        } catch (error) {
          // Handle any errors that occurred during the backend calls
          return { error: "Backend error: " + (error instanceof Error ? error.message : "Unknown error") };
              }
    } else {
      // Return an error for blank password
      return { error: "Password cannot be blank" };
    }
  } else {
    // Return response for non-admin user
    return { username: userName, isAdmin: false};
  }
}


  // old function for checking username
  function checkUserName(userName: string): boolean {
    /*
    if (userName === "") {
      alert("Please enter a user name");
      return false;
    }
    */
    // user name should only contain letters and numbers and be at most 12 characters long
    if (!userName.match(/^[a-zA-Z0-9]{1,12}$/)) {
      alert("User name can only contain letters and numbers and be at most 12 characters long.");
      return false;
    }
    return true;
  }

  // old function for checking username
  function checkUserNameInput(): boolean {
    const userNameInput = document.querySelector('#userNameInput') as HTMLInputElement;
    const userName = userNameInput.value;

    if (userName === "") {
      alert("Please enter a user name");
      return false;
    }
    return true;
  }

  // old function 
  function loadDocument(documentName: string) {
    // set the document name
    spreadSheetClient.documentName = documentName;
    // reload the page

    // the href needs to be updated.   Remove /documnents from the end of the URL
    const href = window.location.href;
    const index = href.lastIndexOf('/');
    let newURL = href.substring(0, index);
    newURL = newURL + "/" + documentName
    window.history.pushState({}, '', newURL);
    window.location.reload();

  }

// updated to account for new state vars
  function logout() {
    // clear the user name
    // window.sessionStorage.setItem('userName', "");
    window.sessionStorage.removeItem('userName');
    window.sessionStorage.removeItem('isAdmin');
    window.sessionStorage.removeItem('isAdminKey');
    // reload the page
    window.location.reload();
  }

 // new admin view
  function buildFileSelectorAdmin(sheetsData: SheetsDataType, setSheetsData: React.Dispatch<React.SetStateAction<SheetsDataType>>) {
    const sheets = spreadSheetClient.getSheets();
  
    function handleSubmitDummy() {
      Object.keys(sheetsData).forEach(sheetName => {
        dummyToggleLockStatus(sheetName, sheetsData[sheetName].isUnlocked, isAdminKey);
      });
    }
  
    return (
      <div>
        <h1>Teacher View</h1>
        {buildToolbar()}
        <table>
          <thead>
            <tr className="selector-title">
              <th>Document Name</th> 
              <th>Lock Status</th>
              <th>Active Users</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(sheetsData).map(sheetName => {
              if(sheetName.indexOf("test1") == -1){sheetsData[sheetName].isUnlocked = false;}
              const sheet = sheetsData[sheetName];
              return (
                <tr className="selector-item">
                  <td className="left" >{sheetName}</td>
                  <td className="notLeft">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        // setSheetsData({
                        //   ...sheetsData,
                        //   [sheetName]: { ...sheet, isUnlocked: !sheet.isUnlocked }
                        // });
                        // e.target.style.borderColor = 'red'; // indicate unsaved change
                        const newSelectedDocument = [...selectedDocument];
                        const index = newSelectedDocument.indexOf(sheetName);
                        if (index === -1) {
                          newSelectedDocument.push(sheetName);
                        } else {
                          newSelectedDocument.splice(index, 1);
                        }
                        setSelectedDocument(newSelectedDocument);
                      }}
                    /> 
                    <span>{!sheet.isUnlocked && "🔒"  }</span>
                  </td>
                  <td style={{ width: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}  className="notLeft" title={sheet.activeUsers.join(', ')}>
                    {sheet.activeUsers.join(', ')}
                  </td>
                  <td>
                    <button onClick={() => loadDocument(sheetName)}>Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button onClick={handleSubmitDummy}>Submit</button>
      </div>
    );
  }
  
  function buildFileSelectorStudent() {
    if (userName === "") {
      return <div>
        <h4>Please enter a user name</h4>
        <br />
        You must be logged in to<br />
        access the documents!
      </div>;
    }

    const sheets: string[] = spreadSheetClient.getSheets();
    // make a table with the list of sheets and a button beside each one to edit the sheet
    return <div>
      <h1>Student View</h1>
      <table>
        <thead>
          <tr className="selector-title">
            <th>Document Name---</th>
            <th>Actions</th>

          </tr>
        </thead>
        <tbody>
          {sheets.map((sheet) => {
              if(sheetsData && sheet.indexOf("test1") == -1 && sheetsData[sheet]){sheetsData[sheet].isUnlocked = false;} // todo dummy data
             const sheet1 = sheetsData[sheet]; 
            return <tr className="selector-item">
              <td  >{sheet}    <span>{sheet1 && !sheet1.isUnlocked && "🔒"  }</span></td>
              <td><button onClick={() => loadDocument(sheet)}>
                 {/* // todo disable button? */}
                Edit
              </button></td>
            </tr>
          })}
        </tbody>
      </table>
    </div >
  }

  function getLoginPanel() {
    return <div>
      <h5 >Login Page</h5>
      <span>Username</span>
      {getUserLogin()}
      <button onClick={handleLogin}>{userName ? 'Change Username': 'Login'}</button>
      {userName && <button onClick={() => logout()}>Logout</button>}
    </div>
  }

  function loginPage() {

    //console.log("username & isadmin are ");
    //userName && console.log(userName);
    //isAdmin && console.log(isAdmin);

    return <table>


      <tbody>
        <tr>
          <td>
            {getLoginPanel()}
          </td>
          <td>
          {userName ? (isAdmin ? buildFileSelectorAdmin(sheetsData, setSheetsData) : buildFileSelectorStudent()) : null}
          </td>
        </tr>
      </tbody>
    </table>


  }



  return (
    <div className="LoginPageComponent">
      {loginPage()}
    </div>
  );
}

export default LoginPageComponent;

import React, { useState, useEffect } from 'react';
import './LoginPageComponent.css';
import './loginPageOnlyCSS.css';
import bcrypt from 'bcryptjs';
import ChatClient from '../Engine/ChatClient';
import SpreadSheetClient, { SheetsDataType } from '../Engine/SpreadSheetClient';

/**
 * Login PageComponent is the component that will be used to display the login page
 * If the user is logged in, then this component will display the list of documents
 * that the user has access to.  Each document will have a button that will allow the
 * user to edit the document. when the user clicks on the button, the user will be
 * taken to the document page.
 */

interface LoginPageProps {
  spreadSheetClient: SpreadSheetClient;
  chatClient: ChatClient;
}
interface LoginResponse {
  username: string;
  isAdmin: boolean;
}

interface LoginError {
  error: string;
}

function  LoginPageComponent({ spreadSheetClient, chatClient }: LoginPageProps): JSX.Element {
  const [userName, setUserName] = useState(window.sessionStorage.getItem('userName') || "");
  const [isAdmin, setIsAdmin] = useState(window.sessionStorage.getItem('isAdmin') === 'true');
  const [sheetsData, setSheetsData] = useState<SheetsDataType>({});
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string[]>([]);

  const baseUrl = spreadSheetClient.getBaseURL();
  // SpreadSheetClient is fetching the documents from the server so we should
  // check every 1/10 of a second to see if the documents have been updated
  useEffect(() => {
    const interval = setInterval(() => {
      const data = spreadSheetClient.getSheetsProps();
      setSheetsData(data);
      const chatLock = chatClient.chatLocked;
      setIsChatLocked(chatLock);
    }, 100);
    return () => clearInterval(interval);
  });

  // creates toolbar for admin users
  function buildToolbar() {
    return (
      <div className="toolbar">
        <button title="Lock all Checked Spreadsheets" onClick={handleLockSheets}>Lock All</button> 
        <button  title="Unlock all Checked Spreadsheets"  onClick={handleUnlockSheets}>Unlock All</button> 
        <button  title="Mute Messenger for all Spreadsheets"   onClick={handleMuteChat}>Mute Chat</button>
        <button title="Unmute Messenger for all Spreadsheets"  onClick={handleUnmuteChat}>Unmute Chat</button>
      </div>
    );
  }

  async function handleLockSheets() {
    selectedDocument.forEach((documentName) => {
      // send request to backend to lock sheet
      spreadSheetClient.lockDocument(documentName, userName);
    });
  }

  async function handleUnlockSheets() {
    selectedDocument.forEach((documentName) => {
      // send request to backend to unlock sheet
      spreadSheetClient.unlockDocument(documentName, userName);
    });
  }

  async function handleMuteChat() {
    chatClient.muteAllUsers(userName);
  }

  async function handleUnmuteChat() {
    chatClient.unmuteAllUsers(userName);
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
  if(userName !== "Admin" && userName !== "admin") {
    // Return response for non-admin user
    return { username: userName, isAdmin: false};
  }
  const password = prompt("Please enter your password");
  if(password === null || password === "") {
    // Return an error for blank password
    return { error: "Password cannot be blank" };
  }
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
  
    return (
      <div>
        <h1>Teacher View</h1>
        {buildToolbar()}
        <table>
          <thead>
            <tr className="selector-title">
              <th>Document Name</th> 
              <th>Lock Status</th>
              
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(sheetsData).map(sheetName => {
              // if(sheetName.indexOf("test1") == -1){sheetsData[sheetName].isUnlocked = false;}
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
                  
                  <td>
                    <button onClick={() => loadDocument(sheetName)}>Open</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* <button onClick={handleSubmitDummy}>Submit</button> */}
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
    const sheets: string[] = Object.keys(sheetsData);
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
              //if(sheetsData && sheet.indexOf("test1") == -1 && sheetsData[sheet]){sheetsData[sheet].isUnlocked = false;} // todo dummy data
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

import React, { useState, useEffect } from 'react';
import './LoginPageComponent.css';
import './loginPageOnlyCSS.css';

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


function  LoginPageComponent({ spreadSheetClient }: LoginPageProps): JSX.Element {
  const [userName, setUserName] = useState(window.sessionStorage.getItem('userName') || "");
  const [isAdmin, setIsAdmin] = useState(window.sessionStorage.getItem('isAdmin') === 'true');
  const [isAdminKey, setIsAdminKey] = useState(window.sessionStorage.getItem('isAdminKey') || "");
  const [documents, setDocuments] = useState<string[]>([]);
  const [sheetsData, setSheetsData] = useState<SheetsDataType>({});


  // SpreadSheetClient is fetching the documents from the server so we should
  // check every 1/20 of a second to see if the documents have been fetched
  useEffect(() => {
    const interval = setInterval(() => {
      const sheets = spreadSheetClient.getSheets();
      if (sheets.length > 0) {
        setDocuments(sheets);
      }
    }, 50);

    const sheets = spreadSheetClient.getSheets();
    const data = dummyGetSpreadSheetData(sheets);
    setSheetsData(data);


    return () => clearInterval(interval);
  });

  // creates toolbar for admin users -TODO
  function buildToolbar() {
    return (
      <div className="toolbar">
        <button >Lock All</button> 
        <button >Unlock All</button> 
        <button >Mute Chat</button>
        <button >Unmute Chat</button>
      </div>
    );
    //TODO ADD METHODS
    // onClick={console.log("lockAll")}
    //  onClick={console.log("unlockAll") }
    //  onClick={console.log("muteChat")}
    // onClick={console.log("unmuteChat")}
  }
    
// fetches extra info for admin users -TODO
  function dummyGetSpreadSheetData(sheets: string[]): SheetsDataType {
    const data: SheetsDataType = {};
  
    // Specific sheets to modify - dummy data 
    // replace with call to backend with isAdminKey
    const specificSheets = ['test1', 'test10.1', 'test10', 'test11', 'test12', 'test13'];
    let index = 1;
  
    sheets.forEach(sheet => {
      if (specificSheets.includes(sheet)) {
        // For specific sheets, set isUnlocked to false and add fake usernames
        data[sheet] = {
          isUnlocked: false,
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

  //updated login funtion - for admin name request login info
  // need to write back end and way to set admin names todo
  function handleLogin() {
    const userNameInput = document.querySelector('#userNameInput') as HTMLInputElement;
  
    if (checkUserNameInput()) { //is username not blank
      const userName = userNameInput.value;
      if (!checkUserName(userName)) { // if username matches regex 
        return;
      }
  
      const loginResponse = dummyLoginCall(userName);
      // TODO
  
      if ('error' in loginResponse) {
        alert(loginResponse.error);
        return;
      }
  
      window.sessionStorage.setItem('userName', loginResponse.username);
      window.sessionStorage.setItem('isAdmin', loginResponse.isAdmin.toString());
      if (loginResponse.isAdmin && loginResponse.isAdminKey) {
        window.sessionStorage.setItem('isAdminKey', loginResponse.isAdminKey!);
      }
  
      setUserName(loginResponse.username);
      setIsAdmin(loginResponse.isAdmin);
      if (loginResponse.isAdminKey) {
        setIsAdminKey(loginResponse.isAdminKey);
      }
      spreadSheetClient.userName = loginResponse.username;
    }
  }
  

  
  //updated login funtion handler - for admin name request login info
  // need to write back end and way to set admin names todo
  function dummyLoginCall(userName: string): LoginResponse | LoginError {
    if (userName === "Admin") { // call to server, check if admin user
      const password = prompt("Please enter your password");
      if (password === "password") { // call to server to authenticate - encrypt this
        return { username: "Admin", isAdmin: true, isAdminKey: "secretKey" }; // secretKey should be encrypted token
      } else {
        return { error: "Wrong password" };
      }
    } else {
      return { username: userName, isAdmin: false };
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
                        setSheetsData({
                          ...sheetsData,
                          [sheetName]: { ...sheet, isUnlocked: !e.target.checked }
                        });
                        e.target.style.borderColor = 'red'; // indicate unsaved change
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

    console.log("username & isadmin are ");
    userName && console.log(userName);
    isAdmin && console.log(isAdmin);

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

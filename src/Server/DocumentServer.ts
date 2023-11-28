/**
 * the server for the DocumentHolder
 *
 * this is an express server that provides the following routes:
 *
 * GET /documents
 *
 * GET /documents/:name
 *
 * PUT /document/request/cell/:name/:cell
 *
 * PUT /document/release/token/:name/:token
 *
 * PUT /document/add/token/:name/:token
 *
 * PUT /document/add/cell/:name/:cell
 *
 * PUT /document/remove/token/:name
 *
 * PUT /document/clear/formula/:name
 *
 * GET /document/formula/string/:name
 *
 * GET /document/result/string/:name
 *
 * GET /document/editstatus/:name
 */

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { DocumentHolder } from "../Engine/DocumentHolder";
import { PortsGlobal } from "../ServerDataDefinitions";
import { Database } from "../Engine/Database";
import UserController from "../Engine/UserController";

// define a debug flag to turn on debugging
let debug = true;

// define a shim for console.log so we can turn off debugging
if (!debug) {
  console.log = () => {};
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Add a middleware function to log incoming requests
app.use((req, res, next) => {
  if (debug) {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// test the server
app.get("/ping", (req, res) => {
  console.log("ping");
  return res.json({ message: "pong" });
});

// toggle debug
app.get("/debug", (req: express.Request, res: express.Response) => {
  debug = !debug;
  console.log(`debug is ${debug}`);
  res.status(200).send(`debug is ${debug}`);
});

// initialize the engine
const documentHolder = new DocumentHolder();
const database = new Database();
const userController = new UserController();

/**
 * User Server
 */
// get user list
app.get("/users", (req: express.Request, res: express.Response) => {
  const users = userController.getAllUsers();
  res.send(users);
});

// add an active user
app.put("/users/:name", (req: express.Request, res: express.Response) => {
  console.log("PUT /users/:name");
  const name = req.params.name;
  if (!name) {
    res.status(400).send("userName is required");
    return;
  }
  userController.addUser(name);
  const users = userController.getAllUsers();

  res.status(200).send(users);
});

// promote a user to admin
app.put("/users/promote", (req: express.Request, res: express.Response) => {
  const userName = req.body.userName;
  if (!userName) {
    res.status(400).send("userName is required");
    return;
  }
  const password = req.body.password;
  if (!password) {
    res.status(400).send("password is required");
    return;
  }

  console.log(`promote ${userName} with password ${password}`);

  const result = userController.promoteUser(userName, password);
  const users = userController.getAllUsers();
  res.status(200).send(users);
});

// assign a user to a group
app.put("/users/assign", (req: express.Request, res: express.Response) => {
  const userName = req.body.userName;
  if (!userName) {
    res.status(400).send("userName is required");
    return;
  }
  const groupName = req.body.groupName;
  if (!groupName) {
    res.status(400).send("groupName is required");
    return;
  }

  console.log(`assign ${userName} to group ${groupName}`);

  const result = userController.assignGroup(userName, groupName);
  const users = userController.getAllUsers();
  res.status(200).send(users);
});

/**
 * Document Server
 */
// get a list of document names
app.get("/documents", (req: express.Request, res: express.Response) => {
  const documentNames = documentHolder.getDocumentNames();
  res.send(documentNames);
});

// add a user to a document for viewing
// userName is in the document body
app.put("/documents/:name", (req: express.Request, res: express.Response) => {
  const name = req.params.name;
  // get the userName from the body
  // console.log(`PUT /documents/:name ${name}`);
  const userName = req.body.userName;
  if (!userName) {
    res.status(400).send("userName is required");
    return;
  }

  // is this name valid?
  const documentNames = documentHolder.getDocumentNames();

  if (documentNames.indexOf(name) === -1) {
    console.log(`Document ${name} not found, creating it`);
    documentHolder.createDocument(name, 5, 8, userName);
  }

  // get the document
  const document = documentHolder.getDocumentJSON(name, userName);

  res.status(200).send(document);
});

// reset all documents, this is for testing
app.post("/documents/reset", (req: express.Request, res: express.Response) => {
  documentHolder.reset();
  res.status(200).send("reset");
});

// create a document
app.post(
  "/documents/create/:name",
  (req: express.Request, res: express.Response) => {
    const name = req.params.name;

    // get the userName from the body
    const userName = req.body.userName;

    // is this name valid?
    const documentNames = documentHolder.getDocumentNames();
    if (documentNames.indexOf(name) === -1) {
      const documentOK = documentHolder.createDocument(name, 5, 8, userName);
    }
    documentHolder.requestViewAccess(name, "A1", userName);
    const documentJSON = documentHolder.getDocumentJSON(name, userName);

    res.status(200).send(documentJSON);
  }
);

// request to edit a cell
app.put(
  "/document/cell/edit/:name",
  (req: express.Request, res: express.Response) => {
    const name = req.params.name;

    // is this name valid?
    const documentNames = documentHolder.getDocumentNames();
    if (documentNames.indexOf(name) === -1) {
      res.status(404).send(`Document ${name} not found`);
      return;
    }
    // get the user name from the body
    // get the cell from the body
    const userName = req.body.userName;
    const cell = req.body.cell;
    if (!userName) {
      res.status(400).send("userName is required");
      return;
    }
    if (!cell) {
      res.status(400).send("cell label is required");
      return;
    }
    // request access to the cell
    const result = documentHolder.requestEditAccess(name, cell, userName);
    const documentJSON = documentHolder.getDocumentJSON(name, userName);

    res.status(200).send(documentJSON);
  }
);

// request to view a cell
app.put(
  "/document/cell/view/:name",
  (req: express.Request, res: express.Response) => {
    const name = req.params.name;

    // is this name valid?
    const documentNames = documentHolder.getDocumentNames();
    if (documentNames.indexOf(name) === -1) {
      res.status(404).send(`Document ${name} not found`);
      return;
    }
    // get the user name from the body
    const userName = req.body.userName;
    const cell = req.body.cell;
    if (!userName) {
      res.status(400).send("userName is required");
      return;
    }
    if (!cell) {
      res.status(400).send("cell label is required");
      return;
    }
    // request access to the cell
    const result = documentHolder.requestViewAccess(name, cell, userName);
    const documentJSON = documentHolder.getDocumentJSON(name, userName);

    res.status(200).send(documentJSON);
  }
);

// add a token to a spreadsheet cell
// TODO: controlled by user.isEditing, set it to false after locking
app.put(
  "/document/addtoken/:name",
  (req: express.Request, res: express.Response) => {
    const name = req.params.name;
    // is this name valid?
    const documentNames = documentHolder.getDocumentNames();
    if (documentNames.indexOf(name) === -1) {
      res.status(404).send(`Document ${name} not found`);
      return;
    }
    // get the user name from the body, and get the token from the body
    const userName = req.body.userName;
    const token = req.body.token;
    if (!userName) {
      res.status(400).send("userName is required");
      return;
    }
    if (!token) {
      res.status(400).send("token is required");
      return;
    }
    // add the token
    const resultJSON = documentHolder.addToken(name, token, userName);

    res.status(200).send(resultJSON);
  }
);

// add a cell reference to a spreadsheet cell
app.put(
  "/document/addcell/:name",
  (req: express.Request, res: express.Response) => {
    const name = req.params.name;

    // is this name valid?
    const documentNames = documentHolder.getDocumentNames();
    if (documentNames.indexOf(name) === -1) {
      res.status(404).send(`Document ${name} not found`);
      return;
    }
    // get the user name  and the cell from the body
    const userName = req.body.userName;
    const cell = req.body.cell;
    if (!userName) {
      res.status(400).send("userName is required");
      return;
    }
    if (!cell) {
      res.status(400).send("cell reference is required");
      return;
    }
    // add the token
    const resultJSON = documentHolder.addCell(name, cell, userName);

    res.status(200).send(resultJSON);
  }
);

// remove a token from a spreadsheet cell
app.put(
  "/document/removetoken/:name",
  (req: express.Request, res: express.Response) => {
    const name = req.params.name;
    // is this name valid?
    const documentNames = documentHolder.getDocumentNames();
    if (documentNames.indexOf(name) === -1) {
      res.status(404).send(`Document ${name} not found`);
      return;
    }
    // get the user name from the body
    const userName = req.body.userName;
    if (!userName) {
      res.status(400).send("userName is required");
      return;
    }
    // remove the tokenn
    const resultJSON = documentHolder.removeToken(name, userName);

    res.status(200).send(resultJSON);
  }
);

// clear the formula from a spreadsheet cell
app.put(
  "/document/clear/formula/:name",
  (req: express.Request, res: express.Response) => {
    const name = req.params.name;
    // is this name valid?
    const documentNames = documentHolder.getDocumentNames();
    if (documentNames.indexOf(name) === -1) {
      res.status(404).send(`Document ${name} not found`);
      return;
    }
    // get the user name from the body
    const userName = req.body.userName;
    if (!userName) {
      res.status(400).send("userName is required");
      return;
    }
    // clear the formula
    const resultJSON = documentHolder.clearFormula(name, userName);

    res.status(200).send(resultJSON);
  }
);

// reset the database
app.get("/reset", (req, res) => {
  console.log("GET /reset");
  database.reset();
  return res.json({ message: "reset" });
});

// GET /message/:user/:message
// this adds a message to the database
app.get("/message/:user/:message", (req, res) => {
  const message = req.params.message;
  const user = req.params.user;
  console.log(`get /message/${message}/${user}`);
  database.addMessage(user, message);
  const result = database.getMessages("");
  return res.json(result);
});

// POST /message
// this adds a message to the database
app.post("/message", (req, res) => {
  const { message, user } = req.body;
  console.log(`post /message with message: ${message} and user: ${user}`);
  database.addMessage(user, message);
  const result = database.getMessages("");
  return res.json(result);
});

// GET /messages/get/:pagingToken?
// this gets messages from the database starting at the pagingToken
app.get("/messages/get/:pagingToken?", (req, res) => {
  // if there is no :pagingToken, then it will be an empty string

  let pagingToken = req.params.pagingToken || "";
  if (pagingToken) {
    console.log(`get /messages/get/${pagingToken}`);
  }

  const result = database.getMessages(pagingToken);
  return res.json(result);
});

// GET /messages/getall
// this gets all the messages from the database, used for debugging
// this is not used in the production mode
app.get("/messages/getall", (req, res) => {
  const result = database.getAllMessages();
  console.log("get /messages/getall");
  return res.json(result);
});

// get the port we should be using
const port = PortsGlobal.serverPort;
// start the app and test it
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

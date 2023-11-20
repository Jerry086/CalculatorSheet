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

// define a debug flag to turn on debugging
let debug = true;

// define a shim for console.log so we can turn off debugging
if (!debug) {
  console.log = () => {};
}

const app = express();
app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'http://pencil.local:3000');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// });
app.use(bodyParser.json());

// Add a middleware function to log incoming requests
app.use((req, res, next) => {
  if (debug) {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// initialize the engine
const documentHolder = new DocumentHolder();
const database = new Database();

// test the server
app.get("/ping", (req, res) => {
  console.log("ping");
  return res.json({ message: "pong" });
});

// GET /documents
app.get("/documents", (req: express.Request, res: express.Response) => {
  const documentNames = documentHolder.getDocumentNames();
  res.send(documentNames);
});

// PUT /documents/:name
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

app.get("/debug", (req: express.Request, res: express.Response) => {
  debug = !debug;
  console.log(`debug is ${debug}`);
  res.status(200).send(`debug is ${debug}`);
});

app.post("/documents/reset", (req: express.Request, res: express.Response) => {
  documentHolder.reset();
  res.status(200).send("reset");
});

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
    // request access to the cell
    const result = documentHolder.requestEditAccess(name, cell, userName);
    const documentJSON = documentHolder.getDocumentJSON(name, userName);

    res.status(200).send(documentJSON);
  }
);

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
    // request access to the cell
    const result = documentHolder.requestViewAccess(name, cell, userName);

    const documentJSON = documentHolder.getDocumentJSON(name, userName);

    res.status(200).send(documentJSON);
  }
);

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
    // add the
    const resultJSON = documentHolder.addToken(name, token, userName);

    res.status(200).send(resultJSON);
  }
);

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
    // add the token
    const resultJSON = documentHolder.addCell(name, cell, userName);

    res.status(200).send(resultJSON);
  }
);

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

// PUT /document/clear/formula/:name
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

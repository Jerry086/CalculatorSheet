import { describe, expect, test } from "@jest/globals";
import { Database, Message } from "../../Engine/Database";
import {
  MessagesContainer,
  MessageContainer,
} from "../../Engine/GlobalDefinitions";

describe("Database", () => {
  let userJose = "Jose";
  let userMaria = "Maria";
  let userJuan = "Juan";
  let userPedro = "Pedro";

  test("addMessage", () => {
    let db = new Database();
    db.reset();
    const messageText = "Hello, world!";
    db.addMessage(userJose, messageText);
    const messages = db.getMessages("");
    const message0 = messages.messages[0];

    expect(message0.user).toBe(userJose);
  });

  test("getMessages 10", () => {
    let db = new Database();
    db.reset();
    for (let i = 0; i < 10; i++) {
      db.addMessage(userJose, `Message ${i}`);
    }

    let messages = db.getMessages("");
    const paginationToken = messages.paginationToken;
    expect(paginationToken).toBe("__END__");
    expect(messages.messages.length).toBe(10);
  });

  test("getAllMessages", () => {
    let db = new Database();
    db.reset();
    for (let i = 0; i < 10; i++) {
      db.addMessage(userJose, `Message ${i}`);
      console.log(`Message ${i}`);
    }
    let messages = db.getAllMessages();
    expect(messages.messages.length).toBe(10);
    expect(messages.paginationToken).toBe("__TEST_DISABLE_IN_PRODUCTION__");
    expect(messages.messages[0].message).toBe("Message 9");
  });

  test("getMessages 25", () => {
    let db = new Database();
    db.reset();
    for (let i = 0; i < 25; i++) {
      db.addMessage(userJose, `Message ${i}`);
    }

    let messages = db.getMessages("");
    const paginationToken = messages.paginationToken;
    expect(paginationToken).toBe("__0000000004__");
    expect(messages.messages.length).toBe(20);

    messages = db.getMessages(messages.paginationToken);
    expect(messages.messages.length).toBe(5);
    expect(messages.paginationToken).toBe("__END__");
  });
  test("getMessages 30", () => {
    let db = new Database();
    db.reset();
    for (let i = 0; i < 30; i++) {
      db.addMessage(userJose, `Message ${i}`);
    }

    let messages = db.getMessages("");
    const paginationToken = messages.paginationToken;
    expect(paginationToken).toBe("__0000000009__");
    expect(messages.messages.length).toBe(20);

    messages = db.getMessages(messages.paginationToken);
    expect(messages.messages.length).toBe(10);
    expect(messages.paginationToken).toBe("__END__");
  });

  test("getMessages 45", () => {
    let db = new Database();
    db.reset();
    for (let i = 0; i < 45; i++) {
      db.addMessage(userJose, `Message ${i}`);
    }

    let messages = db.getMessages("");
    const paginationToken = messages.paginationToken;
    expect(paginationToken).toBe("__0000000024__");
    expect(messages.messages.length).toBe(20);

    messages = db.getMessages(messages.paginationToken);
    expect(messages.messages.length).toBe(20);
    expect(messages.paginationToken).toBe("__0000000004__");

    messages = db.getMessages(messages.paginationToken);
    expect(messages.messages.length).toBe(5);
    expect(messages.paginationToken).toBe("__END__");
  });

  test("getMessages 45 +1", () => {
    let db = new Database();
    db.reset();
    for (let i = 0; i < 45; i++) {
      db.addMessage(userJose, `Message ${i}`);
    }

    let messages = db.getMessages("");
    expect(messages.paginationToken).toBe("__0000000024__");
    expect(messages.messages.length).toBe(20);

    db.addMessage(userJose, `Message Well hello there!`);

    let otherMessages = db.getMessages("");
    expect(otherMessages.messages.length).toBe(20);
    expect(otherMessages.paginationToken).toBe("__0000000025__");

    // Use the old pagination Token it should still work and give me 0004 as the result
    messages = db.getMessages(messages.paginationToken);
    expect(messages.messages.length).toBe(20);
    expect(messages.paginationToken).toBe("__0000000004__");

    db.addMessage(userJose, `Message Well hello there! Again!`);

    messages = db.getMessages(messages.paginationToken);
    expect(messages.messages.length).toBe(5);
    expect(messages.paginationToken).toBe("__END__");

    otherMessages = db.getMessages("");
    expect(otherMessages.messages.length).toBe(20);
    expect(otherMessages.paginationToken).toBe("__0000000026__");
  });
});

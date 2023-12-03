/**
 * This module contains the user controller class.
 * The user controller class is responsible for managing the users of the chat application.
 * It is responsible for adding users, removing users, getting the list of users, and assigning roles and groups to users.
 *
 * @class UserController
 */

import { UserContainer, UsersContainer } from "./GlobalDefinitions";
import bcrypt from "bcryptjs";

class User implements UserContainer {
  /**
   * The user name
   *
   * @private
   * @type {string}
   * @memberof User
   */
  user: string;
  /**
   * The user role
   *
   * @private
   * @type {boolean}
   * @memberof User
   */
  isAdmin: boolean = false;
  /**
   * the group number of the user
   * @param {number} group
   * @memberof User
   *
   * */
  group: number = -1;
  /**
   * Creates an instance of Message.
   * @param {string} user
   * @param {boolean} isAdmin
   * @param {number} group
   * @memberof User
   */

  constructor(user: string, isAdmin: boolean = false, group: number = -1) {
    this.user = user;
    this.isAdmin = isAdmin;
    this.group = group;
  }
}

class UserController {
  /**
   * Array of users
   *
   * @private
   * @type {User[]}
   * @memberof UserController
   */
  private users: User[] = [];
  private error: string = "";
  private plaintextPassword: string = "teamHu";
  private hashedPassword: string = "";

  /**
   * Creates an instance of Database.
   * @memberof Database
   */
  constructor() {
    this.users = [];
    this.error = "";
    this.hashedPassword = "";
    // hash the password
    const saltRounds: number = 10;

    bcrypt.hash(
      this.plaintextPassword,
      saltRounds,
      (err: any, hash: string) => {
        if (err) {
          console.error(err);
          return;
        }
        // Store 'hash' in the database
        this.hashedPassword = hash;
        console.log("hashed password:", this.hashedPassword);
      }
    );
  }

  reset() {
    this.users = [];
    this.error = "";
  }

  /**
   * Add an active user
   *
   * @param {User} user
   * @memberof UserController
   */
  addUser(user: string) {
    // find if the user is already active
    const index = this.users.findIndex((u) => u.user === user);
    if (index === -1) {
      // add the user
      this.users.push(new User(user));
      console.log("added user,", user);
    }
  }

  // remove an active user
  removeUser(user: string) {
    // find if the user is already active
    const index = this.users.findIndex((u) => u.user === user);
    if (index !== -1) {
      // remove the user
      this.users.splice(index, 1);
      console.log("removed user,", user);
    }
  }

  // get a list of all users
  getAllUsers(): UsersContainer {
    const result: UsersContainer = {
      users: this.users,
      error: this.error,
    };
    this.error = "";
    return result;
  }

  // get the names of all non-admin users
  getNonAdminUsers(): string[] {
    const nonAdminUsers: string[] = [];
    this.users.forEach((user) => {
      if (!user.isAdmin) {
        nonAdminUsers.push(user.user);
      }
    });
    return nonAdminUsers;
  }

  // check if a user is active
  isActive(user: string): boolean {
    const index = this.users.findIndex((u) => u.user === user);
    if (index === -1) {
      return false;
    }
    return true;
  }

  // promote a user to admin
  promoteUser(user: string): void {
    const index = this.users.findIndex((u) => u.user === user);
    this.users[index].isAdmin = true;
  }

  // get hashed password
  getHashedPassword(): string {
    return this.hashedPassword;
  }

  // check if a user is an admin
  isAdmin(user: string): boolean {
    const index = this.users.findIndex((u) => u.user === user);
    if (index === -1) {
      return false;
    }
    return this.users[index].isAdmin;
  }

  // assign a user to a group
  assignGroup(user: string, group: number) {
    const index = this.users.findIndex((u) => u.user === user);
    if (index === -1) {
      return;
    }
    this.users[index].group = group;
  }
}

export default UserController;

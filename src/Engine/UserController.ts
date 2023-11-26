/**
 * This module contains the user controller class.
 * The user controller class is responsible for managing the users of the chat application.
 * It is responsible for adding users, removing users, getting the list of users, and assigning roles and groups to users.
 *
 * @class UserController
 */

import { UserContainer, UsersContainer } from "./GlobalDefinitions";

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

  /**
   * Creates an instance of Database.
   * @memberof Database
   */
  constructor() {
    this.users = [];
  }

  reset() {
    this.users = [];
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
    };
    return result;
  }

  // authenticate a user

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

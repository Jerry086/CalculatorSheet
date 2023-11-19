

# Bug 1 Missing Submit Button for login on Login Screen
## Ticket
### Description

Currently, the login page lacks a visible "Login" button. Users can log in by pressing the "Enter" key after typing their username, but this functionality is not intuitive or clearly communicated. The absence of a conventional login button may confuse users and hinder the login process.

### Steps to Reproduce

1. Navigate to the login page.
2. Observe that there is no login button available.

### Expected Behavior

There should be a "Login" button next to the username input field. Clicking this button should initiate the login process.

### Actual Behavior

The login process can only be initiated by pressing the "Enter" key after entering the username. There is no visible button to click for logging in.

### Possible Solution

Add a "Login" button next to the username input field. This button should be clearly labeled and positioned in a way that it is immediately noticeable to users as the action point for logging in.

### Additional Information

- **Severity**: High - affects user experience and usability.
- **Priority**: High - essential for basic functionality and user interaction.

---
## User Story Format
Title: As a user, I want a login button on the login page, so that I can clearly understand how to log in.
**User Story**

- **As a** user,
- **I want** a login button on the login page,
- **So that** I can clearly understand and easily use the interface to log in.

**Acceptance Criteria:**

1. **Visibility of the Login Button:**
   - There should be a clearly labeled "Login" button visible on the login page.
   - The button should be positioned near the username input field for easy access.

2. **Functionality:**
   - Clicking the "Login" button should trigger the same login process as pressing the "Enter" key in the username input field.
   - The login process should successfully authenticate the user if the credentials are correct.

3. **User Feedback:**
   - Upon clicking the "Login" button, the user should receive immediate feedback, either progressing to the logged-in state or receiving an error message for incorrect credentials.





# Bug 2 Missing Submit Button for Username Change on Login Screen
## Ticket

Title: Missing Submit Button for Username Change on Login Screen
### Description

Users have the option to change their username on the login screen. However, the process to submit the new username is not intuitive, as it requires pressing the "Enter" key without any clear instructions. If a user types a new username but navigates away or clicks elsewhere without pressing "Enter," their changes are not saved, leading to confusion.

### Steps to Reproduce

1. Navigate to the login screen.
2. Enter a new username in the username field.
3. Click away or navigate to another page without pressing "Enter."

### Expected Behavior

There should be a clearly visible "Submit" or "Save" button that users can click to confirm their new username.

### Actual Behavior

The username change can only be submitted by pressing the "Enter" key. There is no button or clear indication of this requirement, leading to potential user confusion and unsubmitted username changes.

### Possible Solution

Introduce a "Submit" or "Save" button next to the username input field. This button should clearly indicate its purpose and be easily accessible for users to confirm their username change.

### Additional Information

- **Severity**: Medium - impacts user experience and can lead to confusion.
- **Priority**: Medium - important for ensuring clarity and usability in the username change process.

---
## User Story: Need for Submit Button on Username Change
Title: As a user, I want a submit button for changing my username, so I can be sure my new username is saved.
**User Story**

- **As a** user,
- **I want** a submit button when changing my username on the login screen,
- **So that** I can confidently save my new username without confusion.

**Acceptance Criteria:**

1. **Visible Submit Button:**
   - A visible and clearly labeled "Submit" or "Save" button should be present next to the username input field.
   - This button should be intuitive to use and easily accessible.

2. **Confirmation of Username Change:**
   - Upon clicking the submit button, the user's new username should be saved.
   - The system should provide feedback, such as a confirmation message, to indicate that the username has been successfully changed.

3. **Fallback to Keyboard Interaction:**
   - The option to press 'Enter' to submit the new username should still be functional as a secondary method.


# Bug 3. User Story: Visibility of Logout Button When Logged Out
## Ticket
### Description

The logout button remains visible on the interface even when the user is not logged in. This can be misleading and confusing, as it suggests that the user might be logged in when they are not. The UI should reflect the user's current authentication state accurately.

### Steps to Reproduce

1. Log out of the application or navigate to the application without being logged in.
2. Observe the presence of the logout button.

### Expected Behavior

The logout button should only be visible when the user is logged in. When logged out, this button should be hidden or replaced with a login button.

### Actual Behavior

The logout button is visible regardless of the user's login state, leading to potential confusion about whether the user is currently logged in or not.

### Possible Solution

Implement conditional rendering in the UI to display the logout button only when the user is authenticated and logged in. Alternatively, show a login or sign-in button when the user is logged out.

### Additional Information

- **Severity**: Medium - affects user understanding of their current session state.
- **Priority**: Medium - important for UI clarity and to prevent user confusion.

---


## User Story Format
---


Title: As a user, I want the logout button to be hidden when I'm logged out, so that the UI reflects my current state.
**Body:**

**User Story**

- **As a** user,
- **I want** the logout button to be hidden when I'm not logged in,
- **So that** the user interface accurately reflects my current login state.

**Acceptance Criteria:**

1. **Conditional Visibility:**
   - The logout button should only be visible when the user is logged in.
   - When a user is not logged in, the logout button should not be visible on the screen.

2. **User Interface Consistency:**
   - The UI should consistently reflect the user's current state (logged in or logged out) to avoid confusion.
   - The presence of a logout button when not logged in could mislead users about their authentication state.

3. **User Feedback:**
   - If a logged-out user attempts to access a feature requiring login, they should be directed to the login page instead of seeing a non-functional logout button.



# Bug 4. Failed merge resulted in duplicated lines in ChatComponent.tsx

## Ticket
### Description

A recent merge has resulted in duplicated lines in `ChatComponent.tsx`, causing build failures when running `npm run start`. This issue needs to be addressed to restore the build functionality.

### Steps to Reproduce

1. Perform a `git pull` or update the local repository to the latest commit.
2. Run `npm run start`
3. Observe the build failure due to syntax errors or duplicated lines in `ChatComponent.tsx`.

### Expected Behavior

The application should build successfully without any errors related to merge conflicts in `ChatComponent.tsx`.

### Actual Behavior

The build fails due to duplicated lines and possible syntax errors in `ChatComponent.tsx`, which seem to be a result of a failed merge operation.

### Possible Solution

- Review the `ChatComponent.tsx` file to identify all erroneous duplications and conflicts.
- Resolve these issues by removing duplicated lines and ensuring the correct code is in place.
- Test the build process after resolving the issues to confirm that the application builds and runs successfully.

### Additional Information

- **Severity**: High - prevents the application from building and running.
- **Priority**: High - needs to be resolved to continue development and deployment.

---

## User Story
Not relevant as this is a dev side bug



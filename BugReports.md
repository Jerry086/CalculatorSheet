

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





## Fix status: Fixed
### Details

Login functionality was moved into a new method that is called on pressing enter. A login button was added that also calls this method. Button is changed to change username via conditional rendering when appropriate per bug 2.
 Functionality was tested manually.


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




## Fix status: Fixed
### Details

Login/change username functionality was moved into a new method that is called on pressing enter. A login button was added that also calls this method. Button is changed to change username via conditional rendering when appropriate per bug 1.
Functionality was tested manually.


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





## Fix status: Fixed
### Details

Conditional rendering was used to hide this button when userName is defined. Functionality was tested manually.


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

## Fix status: Fixed
### Details

Code was re-reviewed and duplicated lines were removed. On manual testing the page renders and functions as expected.


# Bug 5 Return to Login page button does not match page theme

## Ticket: 'Return to Login Page' Button Styling Inconsistent with Dark Theme
### Description

The 'Return to Login Page' button currently does not match the dark theme of the rest of the page. This inconsistency in styling affects the visual harmony and overall user experience of the application.

### Steps to Reproduce

1. Navigate to the spreadsheet page after loggging in and see where the 'Return to Login Page' button is located.
2. Observe the styling of the button in contrast with the rest of the page.

### Expected Behavior

The button should be styled to match the dark theme of the page, with appropriate colors, fonts, and UI elements that align with the overall design.

### Actual Behavior

The button's current styling stands out and does not conform to the dark theme, creating a visual inconsistency on the page.

### Possible Solution

- Update the CSS styling of the 'Return to Login Page' button to match the dark mode theme of the page.

### Additional Information

- **Severity**: Medium - affects the visual appeal and user experience.
- **Priority**: Medium - important for UI consistency and professional appearance.

---




## User Story: Styling the 'Return to Login Page' Button to Match Page Theme
Title: As a user, I want the 'Return to Login Page' button to match the page's dark theme for a consistent user experience.
**User Story**

- **As a** user,
- **I want** the 'Return to Login Page' button to match the dark theme of the page,
- **So that** I can have a seamless and visually consistent experience across the application.

**Acceptance Criteria:**

1. **Consistent Styling:**
   - The 'Return to Login Page' button should be styled to match the dark theme of the page.
   - The styling should include appropriate colors, font, and other UI elements that align with the dark design.

## Fix status: Fixed
### Details

Button was changed to match page theme via a new class and css in the appropriate file.
Button was moved to bottom of page so that it was not in the header/title - which seemed incongruous.
Upon manual testing button works as expected and fits page theme.


# Bug 6. Long user name overlap with the cell value
## User Story

As a user, I expect the user name in each cell to be fully visible without overlapping with the cell's value.

Issue with system based on the stated user story:
The bug caused the user name to be too long, resulting in it not being fully visible within the cell, and overlapping with the cell's value.

Repo steps:

1. Open the application and navigate to the section where user names are displayed within cells.
2. Identify a user with a long user name that would potentially cause the issue.
3. Observe that the user name is not fully visible within the cell, and it overlaps with the cell's value.
4. Attempt to edit the user name or perform any relevant actions to trigger the bug.
5. Verify that the user name and cell value overlap persists, making it difficult to read the entire user name.

## Details
The bug is fixed by limiting the user name's length to 1 - 12 characters and only consists of alphanumeric characters.

## Fix status: Fixed


# Bug 7 Can access url without login

##  Ticket

Users can access spreadsheet pages directly via url without setting a username. Spreadsheet page should redirect users to login page if username is not set.

## User Story

As a user I should not be able to access the spreadsheet page without being logged in/having a username. Even though the lack of a password system means this is not a security issue right now - it can still mean I'm unable to change things yet don't see a way to login on the page itself.

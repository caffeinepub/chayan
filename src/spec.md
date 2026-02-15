# Specification

## Summary
**Goal:** Let the signed-in user view and update their profile display name after first login, without overwriting existing profile data on repeated sign-ins.

**Planned changes:**
- Backend: add methods to fetch the caller’s current profile (displayName + encryptionKey) and to update only the caller’s displayName safely (including handling “not registered” callers).
- Backend: make user registration idempotent so repeat login/registration does not overwrite an existing profile’s displayName or encryptionKey.
- Frontend: add an “Edit profile” action in the header user dropdown that opens a dialog to edit display name with Save/Cancel, validation, and error handling (English text).
- Frontend: on app initialization after authentication, fetch the existing profile first; only register a default profile when no profile exists, and keep the UI in sync without a full refresh.

**User-visible outcome:** A signed-in user can edit their display name via an “Edit profile” dialog, see the updated name reflected across the app immediately, and repeated sign-ins no longer reset their existing profile.

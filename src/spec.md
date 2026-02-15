# Specification

## Summary
**Goal:** Rebuild and verify the existing Chayan web chat app so it works end-to-end for a signed-in user with encryption and privacy controls intact.

**Planned changes:**
- Ensure unauthenticated users see only the sign-in screen and all chat features are gated behind Internet Identity login.
- Verify authenticated flow for discovering other registered users (excluding self), starting a 1:1 conversation, and viewing conversation history.
- Ensure sending messages stores only ciphertext on the backend and the UI fetches, decrypts, and displays plaintext correctly.
- Ensure message list refreshes via polling (no real-time sockets).
- Ensure privacy controls work end-to-end: delete message, delete conversation, and clear local encryption keys without breaking the app.

**User-visible outcome:** After signing in with Internet Identity, a user can find contacts, start a 1:1 chat, send encrypted messages that display decrypted after fetch, see messages update via polling, and use privacy options to delete messages/conversations and clear local keys reliably.

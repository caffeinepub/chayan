import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Profile = {
    displayName : Text;
    encryptionKey : Text;
  };

  type Message = {
    sender : Principal;
    recipient : Principal;
    ciphertext : Text;
    timestamp : Time.Time;
  };

  let users = Map.empty<Principal, Profile>();
  let conversations = Map.empty<Principal, List.List<Message>>();

  // Get own profile
  public query ({ caller }) func getCallerProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    users.get(caller);
  };

  // Update profile (idempotent - only updates if user is authenticated)
  public shared ({ caller }) func saveCallerProfile(displayName : Text, encryptionKey : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profile : Profile = {
      displayName;
      encryptionKey;
    };
    users.add(caller, profile);
  };

  // Update display name only
  public shared ({ caller }) func updateDisplayName(newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update display name");
    };
    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found");
      };
      case (?profile) {
        let updatedProfile = {
          displayName = newName;
          encryptionKey = profile.encryptionKey;
        };
        users.add(caller, updatedProfile);
      };
    };
  };

  // Update key only
  public shared ({ caller }) func updateEncryptionKey(newKey : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update encryption key");
    };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile = {
          displayName = profile.displayName;
          encryptionKey = newKey;
        };
        users.add(caller, updatedProfile);
      };
    };
  };

  // Search users by display name
  public query ({ caller }) func searchUsers(searchTerm : Text) : async [(Principal, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for other users");
    };
    let results = List.empty<(Principal, Text)>();
    for ((id, profile) in users.entries()) {
      if (id != caller and profile.displayName.contains(#text searchTerm)) {
        results.add((id, profile.displayName));
      };
    };
    results.toArray();
  };

  // Messaging functions
  public shared ({ caller }) func startConversation(recipient : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start conversations");
    };
    if (not users.containsKey(recipient)) {
      Runtime.trap("User does not exist");
    };

    func ensureConversationExists(user : Principal) {
      switch (conversations.get(user)) {
        case (null) {
          conversations.add(user, List.empty<Message>());
        };
        case (?_) { () };
      };
    };

    ensureConversationExists(caller);
    ensureConversationExists(recipient);
  };

  public shared ({ caller }) func sendMessage(recipient : Principal, ciphertext : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let message = {
      sender = caller;
      recipient;
      ciphertext;
      timestamp = Time.now();
    };

    func addMessage(user : Principal) {
      switch (conversations.get(user)) {
        case (null) {
          let newMsgs = List.empty<Message>();
          newMsgs.add(message);
          conversations.add(user, newMsgs);
        };
        case (?msgs) {
          msgs.add(message);
        };
      };
    };

    addMessage(caller);
    addMessage(recipient);
  };

  public query ({ caller }) func getMessages(recipient : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    switch (conversations.get(caller)) {
      case (null) { [] };
      case (?msgs) {
        msgs.filter(
          func(msg) {
            msg.recipient == recipient or msg.sender == recipient;
          }
        ).toArray();
      };
    };
  };

  public shared ({ caller }) func deleteMessage(recipient : Principal, timestamp : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete messages");
    };
    switch (conversations.get(caller)) {
      case (null) { () };
      case (?msgs) {
        let filteredMsgs = msgs.filter(
          func(msg) {
            not (msg.recipient == recipient and msg.timestamp == timestamp)
          }
        );
        conversations.add(caller, filteredMsgs);
      };
    };
  };

  public shared ({ caller }) func deleteConversation(recipient : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete conversations");
    };
    switch (conversations.get(caller)) {
      case (null) { () };
      case (?msgs) {
        let filteredMsgs = msgs.filter(
          func(msg) {
            not (msg.sender == caller and msg.recipient == recipient);
          }
        );
        conversations.add(caller, filteredMsgs);
      };
    };
  };
};

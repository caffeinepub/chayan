import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Time "mo:core/Time";
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

  public shared ({ caller }) func registerUser(displayName : Text, encryptionKey : Text) : async () {
    users.add(
      caller,
      {
        displayName;
        encryptionKey;
      },
    );
  };

  public query ({ caller }) func searchUsers(searchTerm : Text) : async [(Principal, Text)] {
    let results = List.empty<(Principal, Text)>();

    for ((id, profile) in users.entries()) {
      if (id != caller and profile.displayName.contains(#text searchTerm)) {
        results.add((id, profile.displayName));
      };
    };

    results.toArray();
  };

  public shared ({ caller }) func startConversation(recipient : Principal) : async () {
    if (not users.containsKey(recipient)) {
      return;
    };

    if (not conversations.containsKey(caller)) {
      conversations.add(caller, List.empty<Message>());
    };

    if (not conversations.containsKey(recipient)) {
      conversations.add(recipient, List.empty<Message>());
    };
  };

  public shared ({ caller }) func sendMessage(recipient : Principal, ciphertext : Text) : async () {
    let message = {
      sender = caller;
      recipient;
      ciphertext;
      timestamp = Time.now();
    };

    for (user in [caller, recipient].values()) {
      switch (conversations.get(user)) {
        case (null) { conversations.add(user, List.empty<Message>()) };
        case (?_) { () };
      };
      switch (conversations.get(user)) {
        case (null) { () };
        case (?msgs) {
          msgs.add(message);
        };
      };
    };
  };

  public query ({ caller }) func getMessages(recipient : Principal) : async [Message] {
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

  public shared ({ caller }) func updateEncryptionKey(newKey : Text) : async () {
    switch (users.get(caller)) {
      case (null) { () };
      case (?profile) {
        users.add(
          caller,
          {
            displayName = profile.displayName;
            encryptionKey = newKey;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteConversation(recipient : Principal) : async () {
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

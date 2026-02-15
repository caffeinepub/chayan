import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    ciphertext: string;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface Profile {
    displayName: string;
    encryptionKey: string;
}
export type Time = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteConversation(recipient: Principal): Promise<void>;
    deleteMessage(recipient: Principal, timestamp: Time): Promise<void>;
    getCallerProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMessages(recipient: Principal): Promise<Array<Message>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerProfile(displayName: string, encryptionKey: string): Promise<void>;
    searchUsers(searchTerm: string): Promise<Array<[Principal, string]>>;
    sendMessage(recipient: Principal, ciphertext: string): Promise<void>;
    startConversation(recipient: Principal): Promise<void>;
    updateDisplayName(newName: string): Promise<void>;
    updateEncryptionKey(newKey: string): Promise<void>;
}

import { members } from "../data/membersStub.js";

export function getMembers() {
  return members;
}

export function getMemberById(id) {
  return members.find((m) => m.id === id);
}

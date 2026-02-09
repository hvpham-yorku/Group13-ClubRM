import { members } from "../data/membersStub";

export function getMembers() {
  return members;
}

export function getMemberById(id) {
  return members.find((m) => m.id === id);
}

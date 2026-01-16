import {Room} from "../data/dataTypes";

export const generateRoomTags = (room: Room): string[] => {
  const tags: string[] = [];
  if (room.entities?.berry) {
    tags.push("strawberry")
  }
  if (room.entities?.cassette) {
    tags.push("cassette");
  }
  if (room.entities?.golden) {
    tags.push("golden");
  }
  if (room.entities?.heart) {
    tags.push("crystal heart");
  }
  if (room.entities.binoculars) {
    tags.push("binoculars");
  }
  if (room.entities.car) {
    tags.push("car");
  }
  if (room.entities.gem) {
    tags.push("gem");
  }
  if (room.entities.checkpoint) {
    tags.push("checkpoint");
  }
  if (room.entities.key) {
    tags.push("key");
  }
  return tags;
}
import {RawCelesteLogic} from "./ap/logicHandling";

const goldenRoomId = `end-golden`;
const startOfEmptySpaceRoomArea = `f`;

export const isChapterIndexFarewell = (chapterIndex: number) => chapterIndex === 10;

export const isAfterEmptySpace = (roomId: string) => {
  if (isFarewellGoldenRoom(roomId)) return true;
  const roomArea = roomId[0];
  if (!roomArea) return false;
  return roomArea >= startOfEmptySpaceRoomArea
}

export const isFarewellGoldenRoom = (roomId: string) => roomId === goldenRoomId;

/** Farewell is split into three sections which this will combine them together */
export const combineFarewellRawLogic = (rawLogic: RawCelesteLogic) => {
  const logicLevel = rawLogic.levels.find(l => l.name === `10a`);
  const afterEmptySpace = rawLogic.levels.find(l => l.name === `10b`);
  const endGolden = rawLogic.levels.find(l => l.name === `10c`);
  if (!logicLevel || !afterEmptySpace || !endGolden) throw new Error(`Failed to get split sections of farewell: ${logicLevel} | ${afterEmptySpace} | ${endGolden}`);
  logicLevel.room_connections.push({
    source_room: `e-08`,
    source_door: `east`,
    dest_room: `f-door`,
    dest_door: `west`,
  });
  logicLevel.room_connections.push(...afterEmptySpace.room_connections);
  logicLevel.rooms.push(...afterEmptySpace.rooms);
  logicLevel.room_connections.push({
    source_room: `j-19`,
    source_door: `top`,
    dest_room: `end-golden`,
    dest_door: `bottom`,
  });
  logicLevel.room_connections.push(...endGolden.room_connections);
  logicLevel.rooms.push(...endGolden.rooms);
  return logicLevel;
}
import {RandomizerOptions} from "../provide/ArchipelagoContext";
import {RawCelesteLogic} from "./ap/logicHandling";

const goldenRoomId = `end-golden`;
const startOfEmptySpaceRoomArea = `f`;
const introRoomArea = `intro`;

export const shouldIncludeFarewellRoom = (roomId: string, randomizerOptions: RandomizerOptions) => {
  const includeFarewell = playerIsIncludingFarewell(randomizerOptions);
  if (!includeFarewell) return false;
  if (includeFarewell === `emptySpace` && isAfterEmptySpace(roomId)) return false;
  if (includeFarewell === `farewell` && isFarewellGoldenRoom(roomId)) return false;
  return true;
}

export const playerIsIncludingFarewell = (randomizerOptions: RandomizerOptions): false | `emptySpace` | `farewell` | `endGolden` => {
  if (randomizerOptions.activeLevels.includes(`10c`)) {
    return `endGolden`;
  }
  if (randomizerOptions.activeLevels.includes(`10b`)) {
    return `farewell`;
  }
  if (randomizerOptions.activeLevels.includes(`10a`)) {
    return `emptySpace`;
  }
  return false;
}

export const isChapterIndexFarewell = (chapterIndex: number) => chapterIndex === 10;

export const isAfterEmptySpace = (roomId: string) => {
  if (isFarewellGoldenRoom(roomId)) return true;
  // prevent it considering the intro room as after empty space
  if (roomId.includes(introRoomArea)) return false;
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
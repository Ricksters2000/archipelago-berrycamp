import area from "~/data/celeste.json";
import logic from "~/data/logic.json";
import {Area} from "../data/dataTypes";
import {LocationType} from "../data/ap/apLocationData";
import {RawCelesteLogic, RawLogicLevel} from "../data/ap/logicHandling";

const baseImgUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/img`;

/**
 * Fetch the area during build.
 * 
 * @param areaId The area to get.
 * @returns The area.
 */
export const fetchArea = async (_: string): Promise<Area> => {

  /**
   * Probably never going to add modded map support, always return the celeste area.
   */
  return area as never;
};

export const fetchLogic = async (): Promise<RawCelesteLogic> => {
  return logic as never;
}

export const fetchLogicLevel = async (chapterIndex: number, sideId: string): Promise<RawLogicLevel> => {
  const rawlogic = await fetchLogic();
  const levelName = `${chapterIndex}${sideId}`;
  const logicLevel = rawlogic.levels.find(l => l.name === levelName);
  if (!logicLevel) throw new Error(`Failed to find logic level from: ${chapterIndex}${sideId}`);
  // Farewell is split into three sections which this will combine them together
  if (chapterIndex === 10) {
    const afterEmptySpace = rawlogic.levels.find(l => l.name === `10b`);
    const endGolden = rawlogic.levels.find(l => l.name === `10c`);
    if (!afterEmptySpace || !endGolden) throw new Error(`Failed to get split sections of farewell: ${afterEmptySpace} | ${endGolden}`);
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
  }
  return logicLevel;
}

export const getRootImageUrl = (): string => {
  return `${baseImgUrl}/celeste/chapters/city.png`
}

export const getAreaImageUrl = (areaId: string): string => {
  return `${baseImgUrl}/${areaId}/${areaId}.png`;
};

export const getChapterImageUrl = (areaId: string, chapterId: string): string => {
  return `${baseImgUrl}/${areaId}/chapters/${chapterId}.png`;
};

export const getRoomPreviewUrl = (areaId: string, chapterId: string, sideId: string, roomId: string): string => {
  return `${baseImgUrl}/${areaId}/previews/${chapterId}/${sideId}/${roomId}.png`;
};

export const getRoomImageUrl = (areaId: string, chapterId: string, sideId: string, roomId: string): string => {
  return `${baseImgUrl}/${areaId}/rooms/${chapterId}/${sideId}/${roomId}.png`
};

type ExtraItems = `fullClear`;
export const getCelesteItemImageUrl = (itemName: LocationType | ExtraItems) => {
  return `${baseImgUrl}/celeste/items/${itemName}.png`;
};

type CollectedCelesteItem = `ghostBerry` | `ghostCassette` | `ghostGolden` | `ghostHeart`;
export const getCollectedCelesteItemImageUrl = (itemName: CollectedCelesteItem) => {
  return `${baseImgUrl}/celeste/items/collected/${itemName}.png`;
}

export const getAPIconImageUrl = () => {
  return `${baseImgUrl}/apIcon.png`;
}
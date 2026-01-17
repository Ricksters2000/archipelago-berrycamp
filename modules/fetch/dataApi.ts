import area from "~/data/celeste.json";
import {Area} from "../data/dataTypes";
import {LocationType} from "../data/ap/apLocationData";

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
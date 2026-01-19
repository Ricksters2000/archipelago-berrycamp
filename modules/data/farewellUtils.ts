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
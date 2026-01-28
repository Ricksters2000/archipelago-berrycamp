import {RandomizerOptions} from "~/modules/provide/ArchipelagoContext";

export const includeLevelInTracker = (chapterIndex: number, sideId: string, randomizerOptions: RandomizerOptions) => {
  // always include farewell since there is another function for handling separate rooms in farewell
  if (chapterIndex === 10) return true;
  return randomizerOptions.activeLevels.includes(`${chapterIndex}${sideId.toLowerCase()}`);
}

/** Levels where the level clear and crystal heart are in the same room don't have heart locations
 * since its considered as a level clear instead 
*/
export const levelHasHeartLocation = (chapterIndex: number, sideId: string) => {
  return sideId === `a` && chapterIndex !== 9;
}
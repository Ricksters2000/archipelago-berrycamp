import {RandomizerOptions} from "~/modules/provide/ArchipelagoContext";

export const includeLevelInTracker = (chapterIndex: number, sideId: string, randomizerOptions: RandomizerOptions) => {
  // always include farewell since there is another function for handling separate rooms in farewell
  if (chapterIndex === 10) return true;
  return randomizerOptions.activeLevels.includes(`${chapterIndex}${sideId.toLowerCase()}`);
}
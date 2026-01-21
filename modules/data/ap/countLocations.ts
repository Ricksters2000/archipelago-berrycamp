import {objectKeys} from "~/modules/common/objectKeys";
import {ChapterSides, LevelLocations, MultiRoomLocationKeys, RandomizerOptions, SingleRoomLocationKeys} from "../../provide/ArchipelagoContext";
import {Chapter, Entities, EntitiesWithLogicNameKey, Side} from "../dataTypes";
import {ChapterLogicData, LogicStatus, SideLogicData} from "./logicHandling";
import {isChapterIndexFarewell, shouldIncludeFarewellRoom} from "../farewellUtils";
import {chapterIdToIndex} from "~/modules/common/levelIdToIndex";

export interface LocationCount {
  checked: number;
  accessible: number;
  total: number;
}

export interface FullLocationCount {
  levelClear: LocationCount;
  heart: LocationCount;
  golden: LocationCount;
  cassette: LocationCount;
  checkpoints: LocationCount;
  cars: LocationCount;
  keys: LocationCount;
  gems: LocationCount;
  binoculars: LocationCount;
  strawberries: LocationCount;
  rooms: LocationCount;
  total: LocationCount;
}

type SideProps = Omit<Side, `img` | `canvas` | `name`>

export const getCheckedAndTotalLocationsForChapter = (checkedLocations: ChapterSides, logic: ChapterLogicData, chapter: Omit<Chapter, `desc`>, randomizerOptions: RandomizerOptions): FullLocationCount => {
  const result: FullLocationCount = {
    levelClear: {checked: 0, accessible: 0, total: 0},
    heart: {checked: 0, accessible: 0, total: 0},
    golden: {checked: 0, accessible: 0, total: 0},
    cassette: {checked: 0, accessible: 0, total: 0},
    checkpoints: {checked: 0, accessible: 0, total: 0},
    cars: {checked: 0, accessible: 0, total: 0},
    keys: {checked: 0, accessible: 0, total: 0},
    gems: {checked: 0, accessible: 0, total: 0},
    binoculars: {checked: 0, accessible: 0, total: 0},
    strawberries: {checked: 0, accessible: 0, total: 0},
    rooms: {checked: 0, accessible: 0, total: 0},
    total: {checked: 0, accessible: 0, total: 0},
  }

  if (!randomizerOptions.includeCore && chapter.id === `core`) return result;
  if (!randomizerOptions.includeFarewell && chapter.id === `farewell`) return result;

  // Iterate through each side in the chapter
  for (let i = 0; i < chapter.sides.length; i++) {
    const side = chapter.sides[i]
    if (!side) continue

    // Get the checked locations for this side, or use empty object if it doesn't exist
    const sideCheckedLocations = checkedLocations.sides[i] || {
      checkpoints: {},
      cars: {},
      keys: {},
      gems: {},
      strawberries: {},
      binoculars: {},
      rooms: {},
    }

    const logicSideData = logic.sides[i] || {
      checkpoints: {},
      cars: {},
      keys: {},
      gems: {},
      strawberries: {},
      binoculars: {},
      rooms: {},
    }

    // Get the location count for this side
    const sideCount = getCheckedAndTotalLocationsForSide(sideCheckedLocations, logicSideData, side, chapterIdToIndex(chapter.id), randomizerOptions)

    // Sum up all the counts
    const keys = objectKeys(result);
    for (const key of keys) {
      result[key].checked += sideCount[key].checked
      result[key].accessible += sideCount[key].accessible
      result[key].total += sideCount[key].total
    }
  }

  // Calculate total across all location types
  result.total.checked =
    result.levelClear.checked +
    result.heart.checked +
    result.golden.checked +
    result.cassette.checked +
    result.checkpoints.checked +
    result.cars.checked +
    result.keys.checked +
    result.gems.checked +
    result.binoculars.checked +
    result.strawberries.checked +
    result.rooms.checked

  result.total.total =
    result.levelClear.total +
    result.heart.total +
    result.golden.total +
    result.cassette.total +
    result.checkpoints.total +
    result.cars.total +
    result.keys.total +
    result.gems.total +
    result.binoculars.total +
    result.strawberries.total +
    result.rooms.total

  return result
}

export const getCheckedAndTotalLocationsForSide = (checkedLocations: LevelLocations, sideLogicData: SideLogicData, side: SideProps, chapterIndex: number, randomizerOptions: RandomizerOptions): FullLocationCount => {
  const result: FullLocationCount = {
    levelClear: {checked: 0, accessible: 0, total: 0},
    heart: {checked: 0, accessible: 0, total: 0},
    golden: {checked: 0, accessible: 0, total: 0},
    cassette: {checked: 0, accessible: 0, total: 0},
    checkpoints: {checked: 0, accessible: 0, total: 0},
    cars: {checked: 0, accessible: 0, total: 0},
    keys: {checked: 0, accessible: 0, total: 0},
    gems: {checked: 0, accessible: 0, total: 0},
    binoculars: {checked: 0, accessible: 0, total: 0},
    strawberries: {checked: 0, accessible: 0, total: 0},
    rooms: {checked: 0, accessible: 0, total: 0},
    total: {checked: 0, accessible: 0, total: 0},
  }

  if (!randomizerOptions.includeBSides && side.id === `b`) return result;
  if (!randomizerOptions.includeCSides && side.id === `c`) return result;

  // levelClear - always count (1 per side)
  result.levelClear.total = 1
  if (checkedLocations.levelClear) {
    result.levelClear.checked = 1
  } else if (sideLogicData.levelClear === LogicStatus.Accessible) {
    result.levelClear.accessible = 1
  }

  // heart - only for a-side as the heart for the other sides counts as a level clear
  if (side.id === `a`) {
    let hasHeart = false;
    // check if chapter contains a heart crystal
    for (const roomId in side.rooms) {
      if (side.rooms[roomId]?.entities.heart) {
        hasHeart = true;
        break;
      }
    }
    if (hasHeart) {
      result.heart.total = 1
      if (checkedLocations.heart) {
        result.heart.checked = 1
      } else if (sideLogicData.heart === LogicStatus.Accessible) {
        result.heart.accessible = 1
      }
    }
  }

  // golden - only if includeGoldens is true
  if (randomizerOptions.includeGoldens) {
    let hasGolden = false;
    // check if chapter contains a golden berry
    for (const roomId in side.rooms) {
      if (side.rooms[roomId]?.entities.golden) {
        hasGolden = true;
        break;
      }
    }
    if (hasGolden) {
      result.golden.total = 1
      if (checkedLocations.golden) {
        result.golden.checked = 1
      } else if (sideLogicData.golden === LogicStatus.Accessible) {
        result.golden.accessible = 1
      }
    }
  }

  // cassette - only appears in a-sides
  if (side.id === `a`) {
    let hasCassette = false;
    // check if chapter contains a cassette
    for (const roomId in side.rooms) {
      if (side.rooms[roomId]?.entities.cassette) {
        hasCassette = true;
        break;
      }
    }
    if (hasCassette) {
      result.cassette.total = 1
      if (checkedLocations.cassette) {
        result.cassette.checked = 1
      } else if (sideLogicData.cassette === LogicStatus.Accessible) {
        result.cassette.accessible = 1
      }
    }
  }

  // keys, gems, and checkpoints are always counted as ap locations so these can always be shown
  result.checkpoints = getCheckedAndTotalForSingleRoomItems(`checkpoints`, `checkpoint`, checkedLocations, sideLogicData, side, chapterIndex, randomizerOptions)
  result.keys = getCheckedAndTotalForMultiRoomItems(`keys`, `key`, checkedLocations, sideLogicData, side, chapterIndex, randomizerOptions)
  result.gems = getCheckedAndTotalForSingleRoomItems(`gems`, `gem`, checkedLocations, sideLogicData, side, chapterIndex, randomizerOptions)

  // cars - only if carSanity is true
  if (randomizerOptions.carSanity) {
    result.cars = getCheckedAndTotalForSingleRoomItems(`cars`, `car`, checkedLocations, sideLogicData, side, chapterIndex, randomizerOptions)
  }

  // binoculars - only if binoSanity is true
  if (randomizerOptions.binoSanity) {
    result.binoculars = getCheckedAndTotalForMultiRoomItems(`binoculars`, `binoculars`, checkedLocations, sideLogicData, side, chapterIndex, randomizerOptions)
  }

  // strawberries - always count
  result.strawberries = getCheckedAndTotalForMultiRoomItems(`strawberries`, `berry`, checkedLocations, sideLogicData, side, chapterIndex, randomizerOptions)

  // rooms - only if roomSanity is true
  if (randomizerOptions.roomSanity) {
    result.rooms = getCheckedAndTotalRoomLocations(checkedLocations, sideLogicData, side, chapterIndex, randomizerOptions)
  }

  // Calculate total across all location types
  result.total.checked =
    result.levelClear.checked +
    result.heart.checked +
    result.golden.checked +
    result.cassette.checked +
    result.checkpoints.checked +
    result.cars.checked +
    result.keys.checked +
    result.gems.checked +
    result.binoculars.checked +
    result.strawberries.checked +
    result.rooms.checked

  result.total.total =
    result.levelClear.total +
    result.heart.total +
    result.golden.total +
    result.cassette.total +
    result.checkpoints.total +
    result.cars.total +
    result.keys.total +
    result.gems.total +
    result.binoculars.total +
    result.strawberries.total +
    result.rooms.total

  return result
}

const getCheckedAndTotalForSingleRoomItems = (
  key: SingleRoomLocationKeys,
  entityKey: keyof Entities,
  checkedLocations: LevelLocations,
  logic: SideLogicData,
  side: SideProps,
  chapterIndex: number,
  randomizerOptions: RandomizerOptions,
): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0

  const isFarewell = isChapterIndexFarewell(chapterIndex);

  for (const roomId in side.rooms) {
    // Some rooms may be cutscene or just filler rooms which aren't counted as locations in AP
    if (side.rooms[roomId]?.hideInTracker) continue;
    if (isFarewell && !shouldIncludeFarewellRoom(roomId, randomizerOptions)) continue;
    if (side.rooms[roomId]?.entities[entityKey]) {
      total++;
      if (checkedLocations[key][roomId]) {
        checked++;
      } else if (logic[key][roomId] === LogicStatus.Accessible) {
        accessible++;
      }
    }
  }
  return {
    checked,
    accessible,
    total,
  }
}

const getCheckedAndTotalForMultiRoomItems = (
  key: MultiRoomLocationKeys,
  entityKey: EntitiesWithLogicNameKey,
  checkedLocations: LevelLocations,
  logic: SideLogicData,
  side: SideProps,
  chapterIndex: number,
  randomizerOptions: RandomizerOptions,
): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0

  const isFarewell = isChapterIndexFarewell(chapterIndex);

  for (const roomId in side.rooms) {
    // Some rooms may be cutscene or just filler rooms which aren't counted as locations in AP
    if (side.rooms[roomId]?.hideInTracker) continue;
    if (isFarewell && !shouldIncludeFarewellRoom(roomId, randomizerOptions)) continue;
    const entities = side.rooms[roomId]?.entities[entityKey];
    if (entities) {
      total += entities.length;
      const checkedItems = checkedLocations[key][roomId];
      for (const entity of entities) {
        // @ts-ignore
        if (checkedItems?.[entity.id]) {
          checked++;
        } else if (logic[key]?.[roomId]?.[entity.logicName] === LogicStatus.Accessible) {
          accessible++;
        }
      }
    }
  }
  return {
    checked,
    accessible,
    total,
  }
}

export const getCheckedAndTotalRoomLocations = (
  checkedLocations: LevelLocations,
  logic: SideLogicData,
  side: SideProps,
  chapterIndex: number,
  randomizerOptions: RandomizerOptions,
): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0

  const isFarewell = isChapterIndexFarewell(chapterIndex);

  for (const roomId in side.rooms) {
    // Some rooms may be cutscene or just filler rooms which aren't counted as locations in AP
    if (side.rooms[roomId]?.hideInTracker) continue;
    if (isFarewell && !shouldIncludeFarewellRoom(roomId, randomizerOptions)) continue;
    total++
    if (checkedLocations.rooms[roomId]) {
      checked++
    } else if (logic.rooms[roomId] === LogicStatus.Accessible) {
      accessible++
    }
  }
  return {
    checked,
    accessible,
    total,
  }
}
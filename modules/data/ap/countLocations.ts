import {objectKeys} from "~/modules/common/objectKeys";
import {ChapterSides, LevelLocations, RandomizerOptions} from "../../provide/ArchipelagoContext";
import {Chapter, Side} from "../dataTypes";
import {ChapterLogicData, LogicStatus, SideLogicData} from "./logicHandling";

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
    const sideCount = getCheckedAndTotalLocationsForSide(sideCheckedLocations, logicSideData, side, randomizerOptions)

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

export const getCheckedAndTotalLocationsForSide = (checkedLocations: LevelLocations, sideLogicData: SideLogicData, side: SideProps, randomizerOptions: RandomizerOptions): FullLocationCount => {
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
        result.heart.accessible = 1
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
  result.checkpoints = getCheckedAndTotalCheckpointLocations(checkedLocations, sideLogicData, side)
  result.keys = getCheckedAndTotalKeyLocations(checkedLocations, sideLogicData, side)
  result.gems = getCheckedAndTotalGemLocations(checkedLocations, sideLogicData, side)

  // cars - only if carSanity is true
  if (randomizerOptions.carSanity) {
    result.cars = getCheckedAndTotalCarLocations(checkedLocations, sideLogicData, side)
  }

  // binoculars - only if binoSanity is true
  if (randomizerOptions.binoSanity) {
    result.binoculars = getCheckedAndTotalBinocularLocations(checkedLocations, sideLogicData, side)
  }

  // strawberries - always count
  result.strawberries = getCheckedAndTotalBerryLocations(checkedLocations, sideLogicData, side)

  // rooms - only if roomSanity is true
  if (randomizerOptions.roomSanity) {
    result.rooms = getCheckedAndTotalRoomLocations(checkedLocations, sideLogicData, side)
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

export const getCheckedAndTotalCheckpointLocations = (checkedLocations: LevelLocations, logic: SideLogicData, side: SideProps): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0
  for (const roomId in side.rooms) {
    if (side.rooms[roomId]?.entities.checkpoint) {
      total++;
      if (checkedLocations.checkpoints[roomId]) {
        checked++;
      } else if (logic.checkpoints[roomId] === LogicStatus.Accessible) {
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

export const getCheckedAndTotalCarLocations = (checkedLocations: LevelLocations, logic: SideLogicData, side: SideProps): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0
  for (const roomId in side.rooms) {
    if (side.rooms[roomId]?.entities.car) {
      total++;
      if (checkedLocations.cars[roomId]) {
        checked++;
      } else if (logic.cars[roomId] === LogicStatus.Accessible) {
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

export const getCheckedAndTotalKeyLocations = (checkedLocations: LevelLocations, logic: SideLogicData, side: SideProps): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0
  for (const roomId in side.rooms) {
    const keys = side.rooms[roomId]?.entities.key;
    if (keys) {
      total += keys.length;
      const checkedKeys = checkedLocations.keys[roomId];
      for (const key of keys) {
        if (checkedKeys?.[key.id]) {
          checked++;
        } else if (logic.keys[roomId]?.[key.logicName] === LogicStatus.Accessible) {
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

export const getCheckedAndTotalGemLocations = (checkedLocations: LevelLocations, logic: SideLogicData, side: SideProps): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0
  for (const roomId in side.rooms) {
    if (side.rooms[roomId]?.entities.gem) {
      total++;
      if (checkedLocations.gems[roomId]) {
        checked++;
      } else if (logic.gems[roomId] === LogicStatus.Accessible) {
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

export const getCheckedAndTotalBinocularLocations = (checkedLocations: LevelLocations, logic: SideLogicData, side: SideProps): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0
  for (const roomId in side.rooms) {
    const binoculars = side.rooms[roomId]?.entities.binoculars;
    if (binoculars) {
      total += binoculars.length;
      const checkedBinoculars = checkedLocations.binoculars[roomId];
      for (const bino of binoculars) {
        if (checkedBinoculars?.[bino.id]) {
          checked++;
        } else if (logic.binoculars[roomId]?.[bino.logicName] === LogicStatus.Accessible) {
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

export const getCheckedAndTotalBerryLocations = (checkedLocations: LevelLocations, logic: SideLogicData, side: SideProps): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0
  for (const roomId in side.rooms) {
    const berries = side.rooms[roomId]?.entities.berry;
    if (berries) {
      total += berries.length;
      const checkedStrawberries = checkedLocations.strawberries[roomId];
      for (const berry of berries) {
        if (checkedStrawberries?.[berry.id]) {
          checked++;
        } else if (logic.strawberries[roomId]?.[berry.logicName] === LogicStatus.Accessible) {
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

export const getCheckedAndTotalRoomLocations = (checkedLocations: LevelLocations, logic: SideLogicData, side: SideProps): LocationCount => {
  let checked = 0
  let accessible = 0
  let total = 0
  for (const roomId in side.rooms) {
    // Some rooms may be cutscene or just filler rooms which aren't counted as locations in AP
    if (side.rooms[roomId]?.hideInTracker) continue;
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
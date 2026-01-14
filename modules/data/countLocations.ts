import {ChapterSides, LevelLocations, RandomizerOptions} from "../provide/ArchipelagoContext";
import {Chapter, Side} from "./dataTypes";

export interface LocationCount {
  checked: number;
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

export const getCheckedAndTotalLocationsForChapter = (checkedLocations: ChapterSides, chapter: Omit<Chapter, `desc`>, randomizerOptions: RandomizerOptions): FullLocationCount => {
  const result: FullLocationCount = {
    levelClear: {checked: 0, total: 0},
    heart: {checked: 0, total: 0},
    golden: {checked: 0, total: 0},
    cassette: {checked: 0, total: 0},
    checkpoints: {checked: 0, total: 0},
    cars: {checked: 0, total: 0},
    keys: {checked: 0, total: 0},
    gems: {checked: 0, total: 0},
    binoculars: {checked: 0, total: 0},
    strawberries: {checked: 0, total: 0},
    rooms: {checked: 0, total: 0},
    total: {checked: 0, total: 0},
  }

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

    // Get the location count for this side
    const sideCount = getCheckedAndTotalLocationsForSide(sideCheckedLocations, side, randomizerOptions)

    // Sum up all the counts
    result.levelClear.checked += sideCount.levelClear.checked
    result.levelClear.total += sideCount.levelClear.total
    result.heart.checked += sideCount.heart.checked
    result.heart.total += sideCount.heart.total
    result.golden.checked += sideCount.golden.checked
    result.golden.total += sideCount.golden.total
    result.cassette.checked += sideCount.cassette.checked
    result.cassette.total += sideCount.cassette.total
    result.checkpoints.checked += sideCount.checkpoints.checked
    result.checkpoints.total += sideCount.checkpoints.total
    result.cars.checked += sideCount.cars.checked
    result.cars.total += sideCount.cars.total
    result.keys.checked += sideCount.keys.checked
    result.keys.total += sideCount.keys.total
    result.gems.checked += sideCount.gems.checked
    result.gems.total += sideCount.gems.total
    result.binoculars.checked += sideCount.binoculars.checked
    result.binoculars.total += sideCount.binoculars.total
    result.strawberries.checked += sideCount.strawberries.checked
    result.strawberries.total += sideCount.strawberries.total
    result.rooms.checked += sideCount.rooms.checked
    result.rooms.total += sideCount.rooms.total
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

export const getCheckedAndTotalLocationsForSide = (checkedLocations: LevelLocations, side: SideProps, randomizerOptions: RandomizerOptions): FullLocationCount => {
  const result: FullLocationCount = {
    levelClear: {checked: 0, total: 0},
    heart: {checked: 0, total: 0},
    golden: {checked: 0, total: 0},
    cassette: {checked: 0, total: 0},
    checkpoints: {checked: 0, total: 0},
    cars: {checked: 0, total: 0},
    keys: {checked: 0, total: 0},
    gems: {checked: 0, total: 0},
    binoculars: {checked: 0, total: 0},
    strawberries: {checked: 0, total: 0},
    rooms: {checked: 0, total: 0},
    total: {checked: 0, total: 0},
  }

  // levelClear - always count (1 per side)
  result.levelClear.total = 1
  if (checkedLocations.levelClear) {
    result.levelClear.checked = 1
  }

  // heart - only for a-side as the heart for the other sides counts as a level clear
  if (side.id === `a`) {
    result.heart.total = 1
    if (checkedLocations.heart) {
      result.heart.checked = 1
    }
  }

  // golden - only if includeGoldens is true
  if (randomizerOptions.includeGoldens) {
    result.golden.total = 1
    if (checkedLocations.golden) {
      result.golden.checked = 1
    }
  }

  // cassette - only appears in a-sides
  if (side.id === `a`) {
    result.cassette.total = 1
    if (checkedLocations.cassette) {
      result.cassette.checked = 1
    }
  }

  // checkpoints - only if checkpointSanity is true
  if (randomizerOptions.checkpointSanity) {
    result.checkpoints = getCheckedAndTotalCheckpointLocations(checkedLocations, side)
  }

  // cars - only if carSanity is true
  if (randomizerOptions.carSanity) {
    result.cars = getCheckedAndTotalCarLocations(checkedLocations, side)
  }

  // keys - only if keySanity is true
  if (randomizerOptions.keySanity) {
    result.keys = getCheckedAndTotalKeyLocations(checkedLocations, side)
  }

  // gems - only if gemSanity is true
  if (randomizerOptions.gemSanity) {
    result.gems = getCheckedAndTotalGemLocations(checkedLocations, side)
  }

  // binoculars - only if binoSanity is true
  if (randomizerOptions.binoSanity) {
    result.binoculars = getCheckedAndTotalBinocularLocations(checkedLocations, side)
  }

  // strawberries - always count
  result.strawberries = getCheckedAndTotalBerryLocations(checkedLocations, side)

  // rooms - only if roomSanity is true
  if (randomizerOptions.roomSanity) {
    result.rooms = getCheckedAndTotalRoomLocations(checkedLocations, side)
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

export const getCheckedAndTotalCheckpointLocations = (checkedLocations: LevelLocations, side: SideProps): LocationCount => {
  let checked = 0
  const total = side.checkpoints.length
  // Checkpoints are stored by roomId, check if any room in each checkpoint is checked
  for (const checkpoint of side.checkpoints) {
    for (const roomId of checkpoint.roomOrder) {
      if (checkedLocations.checkpoints[roomId]) {
        checked++
        break // Count each checkpoint only once
      }
    }
  }
  return {
    checked,
    total,
  }
}

export const getCheckedAndTotalCarLocations = (checkedLocations: LevelLocations, side: SideProps): LocationCount => {
  let checked = 0
  let total = 0
  for (const roomId in side.rooms) {
    if (side.rooms[roomId]?.entities.car) {
      total++;
      if (checkedLocations.cars[roomId]) {
        checked++;
      }
    }
  }
  return {
    checked,
    total,
  }
}

export const getCheckedAndTotalKeyLocations = (checkedLocations: LevelLocations, side: SideProps): LocationCount => {
  let checked = 0
  let total = 0
  for (const roomId in side.rooms) {
    const keys = side.rooms[roomId]?.entities.key;
    if (keys) {
      total += keys.length;
      const checkedKeys = checkedLocations.keys[roomId];
      if (!checkedKeys) continue;
      for (const key of keys) {
        if (checkedKeys[key.id]) {
          checked++;
        }
      }
    }
  }
  return {
    checked,
    total,
  }
}

export const getCheckedAndTotalGemLocations = (checkedLocations: LevelLocations, side: SideProps): LocationCount => {
  let checked = 0
  let total = 0
  for (const roomId in side.rooms) {
    if (side.rooms[roomId]?.entities.gem) {
      total++;
      if (checkedLocations.gems[roomId]) {
        checked++;
      }
    }
  }
  return {
    checked,
    total,
  }
}

export const getCheckedAndTotalBinocularLocations = (checkedLocations: LevelLocations, side: SideProps): LocationCount => {
  let checked = 0
  let total = 0
  for (const roomId in side.rooms) {
    const binoculars = side.rooms[roomId]?.entities.binoculars;
    if (binoculars) {
      total += binoculars.length;
      const checkedBinoculars = checkedLocations.binoculars[roomId];
      if (!checkedBinoculars) continue;
      for (const bino of binoculars) {
        if (checkedBinoculars[bino.id]) {
          checked++;
        }
      }
    }
  }
  return {
    checked,
    total,
  }
}

export const getCheckedAndTotalBerryLocations = (checkedLocations: LevelLocations, side: SideProps): LocationCount => {
  let checked = 0
  let total = 0
  for (const roomId in side.rooms) {
    const berries = side.rooms[roomId]?.entities.berry;
    if (berries) {
      total += berries.length;
      const checkedStrawberries = checkedLocations.strawberries[roomId];
      if (!checkedStrawberries) continue;
      for (const berry of berries) {
        if (checkedStrawberries[berry.id]) {
          checked++;
        }
      }
    }
  }
  return {
    checked,
    total,
  }
}

export const getCheckedAndTotalRoomLocations = (checkedLocations: LevelLocations, side: SideProps): LocationCount => {
  let checked = 0
  let total = 0
  for (const roomId in side.rooms) {
    total++
    if (checkedLocations.rooms[roomId]) {
      checked++
    }
  }
  return {
    checked,
    total,
  }
}
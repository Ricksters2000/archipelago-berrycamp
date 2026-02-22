import {MultiEntityLocation, PlayerInventory, RandomizerOptions} from "~/modules/provide/ArchipelagoContext";
import {Location, LogicGraph, NodeConnection, RegionNode} from "./LogicGraph";
import {SideId} from "../dataTypes";
import {combineFarewellRawLogic} from "../farewellUtils";

export interface RawCelesteLogic {
  levels: RawLogicLevel[];
}

export interface RawLogicLevel {
  /**
   * This will contain the index of the chapter and side as the name.
   * ex: `name: "0a"` would be Prologue - A side
   */
  name: string;
  display_name: string;
  rooms: RawLogicRoom[];
  room_connections: RoomConnection[];
}

export interface RawLogicRoom {
  /** Room id */
  name: string;
  regions: RawLogicRegion[];
  doors: RoomDoor[];
  checkpoint: string;
  checkpoint_region: string;
}

/**
 * Shows how all the rooms are connected.
 * Can potentially make a graph or binary tree with this information
 */
interface RoomConnection {
  /** Room id of the current room */
  source_room: string;
  source_door: string;
  /** Room id of the destination room */
  dest_room: string;
  dest_door: string;
}

export interface RawLogicRegion {
  name: string;
  connections: RegionConnection[];
  locations?: RegionLocation[];
}

interface RoomDoor {
  name: string;
  direction: string;
  blocked: boolean;
  closes_behind: boolean;
}

interface RegionConnection {
  dest: string;
  rule: Rules;
}

export type LogicLocationType = `binoculars` | `car` | `cassette` | `clutter` | `crystal_heart` | `gem` | `golden_strawberry` | `key` | `level_clear` | `strawberry`;
interface RegionLocation {
  name: string;
  display_name: string;
  type: LogicLocationType;
  rule: Rules;
}

type RuleType =
  `2500 M Key` |
  `Central Chamber Key 1` |
  `Central Chamber Key 2` |
  `Depths Key` |
  `Entrance Key` |
  `Front Door Key` |
  `Gem 1` |
  `Gem 2` |
  `Gem 3` |
  `Gem 4` |
  `Gem 5` |
  `Gem 6` |
  `Hallway Key 1` |
  `Hallway Key 2` |
  `Huge Mess Key` |
  `Power Source Key 1` |
  `Power Source Key 2` |
  `Power Source Key 3` |
  `Power Source Key 4` |
  `Power Source Key 5` |
  `Presidential Suite Key` |
  `Search Key 1` |
  `Search Key 2` |
  `Search Key 3` |
  `badeline_boosters` |
  `bird` |
  `blue_boosters` |
  `blue_cassette_blocks` |
  `blue_clouds` |
  `breaker_boxes` |
  `brown_clutter` |
  `bumpers` |
  `cannot_access` |
  `coins` |
  `core_blocks` |
  `core_toggles` |
  `dash_refills` |
  `dash_switches` |
  `double_dash_refills` |
  `dream_blocks` |
  `feathers` |
  `fire_ice_balls` |
  `green_cassette_blocks` |
  `green_clutter` |
  `jellyfish` |
  `kevin_blocks` |
  `move_blocks` |
  `moving_platforms` |
  `pink_cassette_blocks` |
  `pink_clouds` |
  `pink_clutter` |
  `pufferfish` |
  `red_boosters` |
  `seekers` |
  `sinking_platforms` |
  `springs` |
  `strawberry_seeds` |
  `swap_blocks` |
  `theo_crystal` |
  `traffic_blocks` |
  `white_block` |
  `yellow_cassette_blocks`;
export type Rules = Array<Array<RuleType>>;

export enum LogicStatus {
  InAccessible,
  Accessible,
  Checked,
}

export interface LogicData {
  chapters: ChapterLogicData[];
}

export interface ChapterLogicData {
  sides: SideLogicData[];
}

/** Anything that is undefined should be considered as Inaccessible */
export interface SideLogicData {
  levelClear?: LogicStatus;
  heart?: LogicStatus;
  golden?: LogicStatus;
  wingedGolden?: LogicStatus;
  cassette?: LogicStatus;
  checkpoints: Record<string, LogicStatus>;
  cars: Record<string, LogicStatus>;
  keys: MultiEntityLocation<string, LogicStatus>;
  gems: Record<string, LogicStatus>;
  binoculars: MultiEntityLocation<string, LogicStatus>;
  strawberries: MultiEntityLocation<string, LogicStatus>;
  rooms: Record<string, LogicStatus>;
}

export const ruleIncludesLockedDoor = (rule: RuleType) => {
  if (rule.includes(`Key`)) return true;
}

export const findLogicSidesFromRawLogic = (rawLogic: RawCelesteLogic, chapterIndex: number) => {
  if (chapterIndex === 10) {
    return [combineFarewellRawLogic(rawLogic)]
  }
  const sides = rawLogic.levels.filter(l => {
    if (l.name.includes(`10`)) return false;
    return l.name.includes(chapterIndex.toString());
  })
  return sides;
}

export const getLogicDataFromChapter = (rawLogic: RawCelesteLogic, chapterIndex: number, inventory: PlayerInventory, randomizerOptions: RandomizerOptions): ChapterLogicData => {
  const sides = findLogicSidesFromRawLogic(rawLogic, chapterIndex);
  const logicSides = sides.map(s => getLogicDataFromSide(s, inventory, randomizerOptions));
  return {sides: logicSides};
}

export const getLogicDataFromSide = (rawLogic: RawLogicLevel, inventory: PlayerInventory, randomizerOptions: RandomizerOptions) => {
  const graph = new LogicGraph(rawLogic);
  const root = graph.getRoot();
  const logicData: SideLogicData = {
    checkpoints: {},
    cars: {},
    keys: {},
    gems: {},
    binoculars: {},
    strawberries: {},
    rooms: {},
  }
  const levelName = rawLogic.name;
  if (levelName === randomizerOptions.goalArea && randomizerOptions.lockGoalArea) {
    // if the player doesn't have enough strawberries to access the level then they can't get anything there in logic
    if (inventory.strawberry < randomizerOptions.strawberriesRequired) return logicData;
  }
  // if the player doesn't have the grannys house key then they can't access the epilogue
  if (levelName === `8a`) {
    if (!inventory.grannysHouseKey) return logicData;
    // These don't appear in the logic file but these are always accessible as long as the player has the grannys house key
    logicData.levelClear = LogicStatus.Accessible;
    logicData.rooms[`inside`] = LogicStatus.Accessible;
  }
  const chapterIndex = parseInt(levelName.substring(0, levelName.length - 1));
  const sideId = levelName.substring(levelName.length - 1) as SideId;
  const regionsChecked: Record<string, Record<string, boolean>> = {};
  let regionsToRecheck: Array<RegionNode> = [];
  const accessibleKeys: Array<string> = [];
  traverseNode(chapterIndex, sideId, root, logicData, inventory, randomizerOptions, regionsChecked, regionsToRecheck, accessibleKeys);
  const checkpoints = inventory.checkpoints[chapterIndex]?.[sideId]
  if (checkpoints) {
    const checkpointNodes = graph.getCheckpointNodes();
    for (const roomId in checkpoints) {
      const node = checkpointNodes.find(n => n.roomId === roomId);
      if (node) {
        traverseNode(chapterIndex, sideId, node, logicData, inventory, randomizerOptions, regionsChecked, regionsToRecheck, accessibleKeys);
      }
    }
  }
  regionsToRecheck = [...new Set(regionsToRecheck)]
  while (regionsToRecheck.length > 0) {
    const node = regionsToRecheck.pop();
    if (!node) continue;
    regionsChecked[node.roomId] = {
      ...regionsChecked[node.roomId],
      [node.name]: false,
    }
    traverseNode(chapterIndex, sideId, node, logicData, inventory, randomizerOptions, regionsChecked, regionsToRecheck, accessibleKeys, false)
  }
  return logicData;
}

const traverseNode = (
  chapterIndex: number,
  sideId: SideId,
  node: RegionNode,
  logicData: SideLogicData,
  inventory: PlayerInventory,
  randomizerOptions: RandomizerOptions,
  regionsChecked: Record<string, Record<string, boolean>> = {},
  regionsToRecheck: Array<RegionNode> = [],
  accessibleKeys: Array<string> = [],
  firstCheck = true,
) => {
  let roomRegionsChecked = regionsChecked[node.roomId];
  if (roomRegionsChecked) {
    if (roomRegionsChecked[node.name]) return;
    roomRegionsChecked[node.name] = true;
  } else {
    regionsChecked[node.roomId] = {[node.name]: true};
  }
  logicData.rooms[node.roomId] = LogicStatus.Accessible;
  if (node.checkpoint) {
    logicData.checkpoints[node.roomId] = LogicStatus.Accessible;
  }
  /** Some areas may need to be checked twice like locked doors may want to know if the required key can be accessed before checking */
  const shouldDoubleCheck = (rules: Rules) => {
    if (!firstCheck) return false;
    for (const ruleGroup of rules) {
      for (const rule of ruleGroup) {
        if (!randomizerOptions.keySanity && rule.includes(`Key`)) return true;
      }
    }
    return false;
  }
  const connectionsToRecheck: Array<NodeConnection> = []
  const locationsToRecheck: Array<Location> = []
  const checkConnection = (conn: NodeConnection) => {
    if (passesRules(chapterIndex, sideId, conn.rules, inventory, accessibleKeys)) {
      traverseNode(chapterIndex, sideId, conn.child, logicData, inventory, randomizerOptions, regionsChecked, regionsToRecheck, accessibleKeys);
    } else if (shouldDoubleCheck(conn.rules)) {
      connectionsToRecheck.push(conn)
      regionsToRecheck.push(node)
    } else if (!logicData.rooms[node.roomId]) {
      logicData.rooms[node.roomId] = LogicStatus.InAccessible;
    }
  }
  const checkLocation = (loc: Location) => {
    let logicStatus;
    if (passesRules(chapterIndex, sideId, loc.rules, inventory, accessibleKeys)) {
      if (!randomizerOptions.keySanity && loc.type === `key`) {
        accessibleKeys.push(loc.displayName)
      }
      logicStatus = LogicStatus.Accessible;
    } else {
      if (shouldDoubleCheck(loc.rules)) {
        locationsToRecheck.push(loc);
        regionsToRecheck.push(node);
      }
      logicStatus = LogicStatus.InAccessible;
    }
    setLocationLogic(node.roomId, loc.name, logicData, loc.type, logicStatus);
  }
  for (const conn of node.connections) {
    checkConnection(conn)
  }
  for (const loc of node.locations) {
    checkLocation(loc)
  }
}

const passesRules = (chapterIndex: number, sideId: SideId, rules: Rules, inventory: PlayerInventory, accessibleKeys: Array<string>) => {
  if (rules.length === 0) return true;
  for (const ruleArr of rules) {
    let passes = true;
    for (const rule of ruleArr) {
      if (!passesRule(chapterIndex, sideId, rule, inventory, accessibleKeys)) {
        passes = false;
        break;
      }
    }
    if (passes) return true;
  }
  return false;
}

function passesRule(
  chapterIndex: number,
  sideId: SideId,
  ruleType: RuleType,
  inventory: PlayerInventory,
  accessibleKeys: Array<string>,
): boolean {
  switch (ruleType) {
    //
    // ───────────────────────────────
    // KEYS
    // ───────────────────────────────
    //
    case "2500 M Key":
    case "Central Chamber Key 1":
    case "Central Chamber Key 2":
    case "Depths Key":
    case "Entrance Key":
    case "Front Door Key":
    case "Hallway Key 1":
    case "Hallway Key 2":
    case "Huge Mess Key":
    case "Power Source Key 1":
    case "Power Source Key 2":
    case "Power Source Key 3":
    case "Power Source Key 4":
    case "Power Source Key 5":
    case "Presidential Suite Key":
    case "Search Key 1":
    case "Search Key 2":
    case "Search Key 3": {
      // If keysanity is disabled then it can assume that the player can reach this as long as the required key is accessible
      if (accessibleKeys.includes(ruleType)) {
        return true;
      }
      const chapter = inventory.keys[chapterIndex];
      const side = chapter?.[sideId];
      return !!side?.[ruleType];
    }

    //
    // ───────────────────────────────
    // GEMS
    // ───────────────────────────────
    //
    case "Gem 1":
    case "Gem 2":
    case "Gem 3":
    case "Gem 4":
    case "Gem 5":
    case "Gem 6": {
      const chapter = inventory.gems[chapterIndex];
      const side = chapter?.[sideId];
      return !!side?.[ruleType];
    }

    //
    // ───────────────────────────────
    // GLOBAL INVENTORY FLAGS
    // ───────────────────────────────
    //
    case "badeline_boosters":
      return !!inventory.badelineBoosters;
    case "bird":
      return !!inventory.bird;
    case "blue_boosters":
      return !!inventory.blueBoosters;
    case "blue_cassette_blocks":
      return !!inventory.blueCassetteBlocks;
    case "blue_clouds":
      return !!inventory.blueClouds;
    case "breaker_boxes":
      return !!inventory.breakerBoxes;
    case "bumpers":
      return !!inventory.bumpers;
    case "coins":
      return !!inventory.coins;
    case "core_blocks":
      return !!inventory.coreBlocks;
    case "core_toggles":
      return !!inventory.coreToggles;
    case "dash_refills":
      return !!inventory.dashRefills;
    case "dash_switches":
      return !!inventory.dashSwitches;
    case "double_dash_refills":
      return !!inventory.doubleDashRefills;
    case "dream_blocks":
      return !!inventory.dreamBlocks;
    case "feathers":
      return !!inventory.feathers;
    case "fire_ice_balls":
      return !!inventory.fireAndIceBalls;
    case "green_cassette_blocks":
      return !!inventory.greenCassetteBlocks;
    case "jellyfish":
      return !!inventory.jellyfish;
    case "kevin_blocks":
      return !!inventory.kevins;
    case "move_blocks":
      return !!inventory.moveBlocks;
    case "moving_platforms":
      return !!inventory.movingPlatforms;
    case "pink_cassette_blocks":
      return !!inventory.pinkCassetteBlocks;
    case "pink_clouds":
      return !!inventory.pinkClouds;
    case "pufferfish":
      return !!inventory.pufferfish;
    case "red_boosters":
      return !!inventory.redBoosters;
    case "seekers":
      return !!inventory.seekers;
    case "sinking_platforms":
      return !!inventory.sinkingPlatforms;
    case "springs":
      return !!inventory.springs;
    case "strawberry_seeds":
      return !!inventory.strawberrySeeds;
    case "swap_blocks":
      return !!inventory.swapBlocks;
    case "theo_crystal":
      return !!inventory.theoCrystal;
    case "traffic_blocks":
      return !!inventory.trafficBlocks;
    case "white_block":
      return !!inventory.whiteBlock;
    case "yellow_cassette_blocks":
      return !!inventory.yellowCassetteBlocks;

    //
    // ───────────────────────────────
    // SPECIAL CASES
    // ───────────────────────────────
    //
    case "brown_clutter":
      return !!inventory.brownClutter;
    case "green_clutter":
      return !!inventory.greenClutter;
    case "pink_clutter":
      return !!inventory.pinkClutter;
    case "cannot_access":
      return false;
  }
}

const setLocationLogic = (roomId: string, itemName: string, logicData: SideLogicData, locationType: LogicLocationType, status: LogicStatus) => {
  switch (locationType) {
    case `level_clear`:
      logicData.levelClear = status;
      break;
    case `crystal_heart`:
      logicData.heart = status;
      break;
    case `cassette`:
      logicData.cassette = status;
      break;
    case `golden_strawberry`:
      if (itemName === `winged_golden`) {
        logicData.wingedGolden = status;
      } else {
        logicData.golden = status;
      }
      break;
    case `gem`:
      logicData.gems[roomId] = status;
      break;
    case `car`:
      logicData.cars[roomId] = status;
      break;
    case `binoculars`:
      const binocularRegions = logicData.binoculars[roomId];
      if (binocularRegions) {
        binocularRegions[itemName] = status;
      } else {
        logicData.binoculars[roomId] = {[itemName]: status};
      }
      break;
    case `key`:
      const keyRegions = logicData.keys[roomId];
      if (keyRegions) {
        keyRegions[itemName] = status;
      } else {
        logicData.keys[roomId] = {[itemName]: status};
      }
      break;
    case `strawberry`:
      const strawberryRegions = logicData.strawberries[roomId];
      if (strawberryRegions) {
        strawberryRegions[itemName] = status;
      } else {
        logicData.strawberries[roomId] = {[itemName]: status};
      }
      break;
    case `clutter`:
      break;
  }
}
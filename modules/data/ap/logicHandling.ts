import {MultiEntityLocation} from "~/modules/provide/ArchipelagoContext";

export interface RawCelesteLogic {
  levels: Level[];
}

interface Level {
  /**
   * This will contain the index of the chapter and side as the name.
   * ex: `name: "0a"` would be Prologue - A side
   */
  name: string;
  display_name: string;
  rooms: Room[];
  room_connections: RoomConnection[];
}

interface Room {
  /** Room id */
  name: string;
  regions: Region[];
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

interface Region {
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

type LocationType = `binoculars` | `car` | `cassette` | `clutter` | `crystal_heart` | `gem` | `golden_strawberry` | `key` | `level_clear` | `strawberry`;
interface RegionLocation {
  name: string;
  display_name: string;
  type: LocationType;
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
type Rules = Array<Array<RuleType>>;

export enum LogicStatus {
  InAccessible,
  Accessible,
  Checked,
}

export interface LogicData {
  chapters: [];
}

export interface ChapterLogicData {
  sides: [];
}

export interface SideLogicData {
  levelClear: LogicStatus;
  heart: LogicStatus;
  golden: LogicStatus;
  cassette: LogicStatus;
  checkpoints: Record<string, LogicStatus>;
  cars: Record<string, LogicStatus>;
  keys: MultiEntityLocation<number, LogicStatus>;
  gems: Record<string, LogicStatus>;
  binoculars: MultiEntityLocation<string, LogicStatus>;
  strawberries: MultiEntityLocation<number, LogicStatus>;
  rooms: Record<string, LogicStatus>;
}
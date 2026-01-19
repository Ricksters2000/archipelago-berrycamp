import {ExtentCanvasPoint, ExtentCanvasSize, ExtentCanvasViewBox} from "extent-canvas";

export interface Area {
  id: string;
  gameId: string;
  name: string;
  desc: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  gameId: string;
  name: string
  desc: string;
  chapterNo?: number;
  sides: Side[];
}

export interface Side {
  id: string;
  name: string;
  checkpoints: Checkpoint[];
  rooms: Record<string, Room>;
  roomCount: number;
  canvas: Canvas;
  img: string;
}

/**
 * @property name The name of the checkpoint.
 * @property abbreviation A checkpoint abbrivation.
 * @property roomCount The number of unique rooms in the checkpoint.
 * @property roomOrder The order of the rooms in the checkpoint.
 */
export interface Checkpoint {
  name: string
  abbreviation: string;
  roomCount: number;
  roomOrder: string[];
  canvas: Canvas;
}

export interface Room {
  name: string;
  checkpointNo: number;
  defaultSpawn: ExtentCanvasPoint;
  entities: Partial<Entities>;
  canvas: Canvas;
  hideInTracker?: boolean;
}

export interface Entities {
  spawn: SpawnPoint[];
  berry: BerryPoint[];
  binoculars: IdPoint<string>[];
  key: IdPoint<number>[];
  checkpoint: ExtentCanvasPoint[];
  gem: ExtentCanvasPoint[];
  car: ExtentCanvasPoint[];
  golden: ExtentCanvasPoint[];
  heart: ExtentCanvasPoint[];
  cassette: ExtentCanvasPoint[];
}

export interface SpawnPoint extends ExtentCanvasPoint {
  name?: string;
}

export interface BerryPoint extends ExtentCanvasPoint {
  id: number;
  checkpointId: number;
  logicName: string;

  // Currently broken.
  order: number;
}

export interface IdPoint<T extends number | string> extends ExtentCanvasPoint {
  id: T;
  logicName: string;
}

export interface Canvas {
  position: ExtentCanvasPoint;
  size: ExtentCanvasSize;
  boundingBox: ExtentCanvasViewBox;
}

export type SideId = `a` | `b` | `c`;

export type CelesteSlotData = {
  active_levels: string[];
  active_traps: Record<number, number>;
  apworld_version: number;
  binosanity: number;
  carsanity: number;
  checkpointsanity: number;
  chosen_poem: number;
  death_link: number;
  death_link_amnesty: number;
  gemsanity: number;
  goal_area: string;
  include_b_sides: number;
  include_c_sides: number;
  include_core: number;
  include_farewell: number;
  include_goldens: number;
  keysanity: number;
  lock_goal_area: number;
  madeline_feather_hair_color: number;
  madeline_hair_length: number;
  madeline_no_dash_hair_color: number;
  madeline_one_dash_hair_color: number;
  madeline_two_dash_hair_color: number;
  min_mod_version: number;
  music_map: Record<number, number>;
  music_shuffle: number;
  require_cassettes: number;
  roomsanity: number;
  strawberries_required: number;
  trap_expiration_action: number;
  trap_expiration_amount: number;
  trap_link: number;
}
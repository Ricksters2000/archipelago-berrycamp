import {Client} from "archipelago.js";
import {createContext, useContext} from "react";
import {ConnectionStatus} from "../data/ConnectionStatus";

export type ChapterItems<V = RoomItems> = Record<number, SideItems<V>>;

type SideItems<V = RoomItems> = {
  a?: V;
  b?: V;
  c?: V;
}

type RoomItems = Record<string, true>;

export type PlayerInventory = {
  checkpoints: ChapterItems;
  /** The key from the `RoomItems` type will be the key name */
  keys: ChapterItems;
  /** The key from the `RoomItems` type will be the gem name */
  gems: ChapterItems;
  strawberry: number;
  springs?: true;
  trafficBlocks?: true;
  pinkCassetteBlocks?: true;
  blueCassetteBlocks?: true;
  dreamBlocks?: true;
  coins?: true;
  movingPlatforms?: true;
  blueBoosters?: true;
  blueClouds?: true;
  moveBlocks?: true;
  swapBlocks?: true;
  redBoosters?: true;
  theoCrystal?: true;
  feathers?: true;
  bumpers?: true;
  kevins?: true;
  pinkClouds?: true;
  badelineBoosters?: true;
  fireAndIceBalls?: true;
  coreToggles?: true;
  coreBlocks?: true;
  pufferfish?: true;
  jellyfish?: true;
  breakerBoxes?: true;
  dashRefills?: true;
  doubleDashRefills?: true;
  yellowCassetteBlocks?: true;
  greenCassetteBlocks?: true;
  dashSwitches?: true;
  seekers?: true;
  strawberrySeeds?: true;
  sinkingPlatforms?: true;
  whiteBlock?: true;
  torches?: true;
  bird?: true;
  pinkClutter?: true;
  greenClutter?: true;
  brownClutter?: true;
}

/** The first id is for the room id and then for the entity id */
export type MultiEntityLocation<K extends string | number | symbol, V = true> = Record<string, Record<K, V>>;

export type SingleRoomLocationKeys = keyof Pick<LevelLocations, `checkpoints` | `cars` | `gems` | `rooms`>;
export type MultiRoomLocationKeys = keyof Pick<LevelLocations, `strawberries` | `binoculars` | `keys`>;

export type LevelLocations = {
  levelClear?: true;
  heart?: true;
  golden?: true;
  cassette?: true;
  checkpoints: Record<string, true>;
  cars: Record<string, true>;
  keys: MultiEntityLocation<number>;
  gems: Record<string, true>;
  binoculars: MultiEntityLocation<string>;
  strawberries: MultiEntityLocation<number>;
  rooms: Record<string, true>;
}

export type ChapterSides = {
  sides: Array<LevelLocations>
}

export type CheckedLocations = {
  area: {
    celeste: Record<number, ChapterSides>;
  }
}

// anything thats not on here should be randomized by default
export type RandomizerOptions = {
  activeLevels: Array<string>;
  goalArea: string;
  lockGoalArea: boolean;
  strawberriesRequired: number;
  checkpointSanity: boolean;
  binoSanity: boolean;
  keySanity: boolean;
  gemSanity: boolean;
  carSanity: boolean;
  roomSanity: boolean;
  includeGoldens: boolean;
  includeCore: boolean;
  includeFarewell: false | `empty-space` | `farewell`;
  includeBSides: boolean;
  includeCSides: boolean;
}

export interface IArchipelagoContext {
  client: Client;
  connectionStatus: ConnectionStatus;
  errorMsg: string,
  randomizerOptions: RandomizerOptions;
  checkedLocations: CheckedLocations;
  playerInventory: PlayerInventory;
  login: (host: string, name: string, password: string) => void;
}

export const defaultRandomizerOptions: RandomizerOptions = {
  activeLevels: [],
  goalArea: `7a`,
  lockGoalArea: true,
  strawberriesRequired: 40,
  checkpointSanity: false,
  binoSanity: false,
  keySanity: false,
  gemSanity: false,
  carSanity: false,
  roomSanity: false,
  includeGoldens: false,
  includeCore: false,
  includeFarewell: false,
  includeBSides: false,
  includeCSides: false,
}

export const defaultCheckedLocations: CheckedLocations = {
  area: {
    celeste: [],
  }
}

export const createBlankChapter = (): ChapterSides => {
  return {sides: []}
}

export const createBlankSide = (): LevelLocations => {
  return {
    checkpoints: {},
    cars: {},
    keys: {},
    gems: {},
    strawberries: {},
    binoculars: {},
    rooms: {},
  }
}

export const createEmptyPlayerInventory = (): PlayerInventory => ({
  strawberry: 0,
  pinkClutter: true,
  checkpoints: {},
  keys: {},
  gems: {},
})

export const ArchipelagoContext = createContext<IArchipelagoContext>({
  client: new Client(),
  connectionStatus: ConnectionStatus.NoConnection,
  errorMsg: ``,
  randomizerOptions: defaultRandomizerOptions,
  checkedLocations: defaultCheckedLocations,
  playerInventory: createEmptyPlayerInventory(),
  login: () => undefined,
})

export const useArchipelagoContext = (): IArchipelagoContext => {
  return useContext<IArchipelagoContext>(ArchipelagoContext)
}
import {Client} from "archipelago.js";
import {createContext, useContext} from "react";
import {ConnectionStatus} from "../data/ConnectionStatus";

/** The first id is for the room id and then for the entity id */
type MultiEntityLocation<K extends string | number | symbol> = Record<string, Record<K, true>>;

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
  login: (host: string, name: string, password: string) => void;
}

export const defaultRandomizerOptions: RandomizerOptions = {
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

export const ArchipelagoContext = createContext<IArchipelagoContext>({
  client: new Client(),
  connectionStatus: ConnectionStatus.NoConnection,
  errorMsg: ``,
  randomizerOptions: defaultRandomizerOptions,
  checkedLocations: defaultCheckedLocations,
  login: () => undefined,
})

export const useArchipelagoContext = (): IArchipelagoContext => {
  return useContext<IArchipelagoContext>(ArchipelagoContext)
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
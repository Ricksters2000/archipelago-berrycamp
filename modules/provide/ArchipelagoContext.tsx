import {Client} from "archipelago.js";
import {createContext, useContext} from "react";
import {ConnectionStatus} from "../data/ConnectionStatus";

export type LevelLocations = {
  levelClear?: true;
  heart?: true;
  golden?: true;
  cassette?: true;
  checkpoints: Record<string, true>;
  cars: Record<string, true>;
  keys: Record<string, true>;
  gems: Record<string, true>;
  binoculars: Record<string, true>;
  strawberries: Record<string, true>;
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
  randomizerOptions: defaultRandomizerOptions,
  checkedLocations: defaultCheckedLocations,
  login: () => undefined,
})

export const useArchipelagoContext = (): IArchipelagoContext => {
  return useContext<IArchipelagoContext>(ArchipelagoContext)
}
import {Client} from "archipelago.js";
import {createContext, useContext} from "react";
import {ConnectionStatus} from "../data/ConnectionStatus";

export interface IArchipelagoContext {
  client: Client;
  connectionStatus: ConnectionStatus;
  login: (host: string, name: string, password: string) => void;
}

export const ArchipelagoContext = createContext<IArchipelagoContext>({
  client: new Client(),
  connectionStatus: ConnectionStatus.NoConnection,
  login: () => undefined,
})

export const useArchipelagoContext = (): IArchipelagoContext => {
  return useContext<IArchipelagoContext>(ArchipelagoContext)
}
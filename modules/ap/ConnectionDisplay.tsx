import {FC} from "react";
import {useArchipelagoContext} from "../provide/ArchipelagoContext";
import {ConnectionStatus} from "../data/ConnectionStatus";
import {Typography} from "@mui/material";

export const ConnectionDisplay: FC = () => {
  const {connectionStatus, errorMsg} = useArchipelagoContext();

  if (![ConnectionStatus.Connected, ConnectionStatus.Disconnected, ConnectionStatus.Error].includes(connectionStatus)) {
    return null;
  }
  return (
    <Typography color={connectionStatus === ConnectionStatus.Connected ? `green` : `red`}>
      {
        connectionStatus === ConnectionStatus.Connected ? `Connected`
          : connectionStatus === ConnectionStatus.Disconnected ? `Disconnected`
            : errorMsg
      }
    </Typography>
  )
}
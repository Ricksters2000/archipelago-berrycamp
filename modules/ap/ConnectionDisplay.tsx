import {FC} from "react";
import {useArchipelagoContext} from "../provide/ArchipelagoContext";
import {ConnectionStatus} from "../data/ConnectionStatus";
import {styled, Typography} from "@mui/material";

export const ConnectionDisplay: FC = () => {
  const {connectionStatus, errorMsg} = useArchipelagoContext();

  if (![ConnectionStatus.Connected, ConnectionStatus.Disconnected, ConnectionStatus.Error].includes(connectionStatus)) {
    return null;
  }
  return (
    <Typography color={connectionStatus === ConnectionStatus.Connected ? `green` : `red`}>
      {
        connectionStatus === ConnectionStatus.Connected ? <GreenText>Connected</GreenText>
          : connectionStatus === ConnectionStatus.Disconnected ? `Disconnected`
            : errorMsg
      }
    </Typography>
  )
}

const GreenText = styled(`span`)(({theme}) => ({
  color: theme.palette.mode === "light" ? `#00af00` : `#35ff35`,
}));
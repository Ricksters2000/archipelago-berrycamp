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
    <Typography>
      {
        connectionStatus === ConnectionStatus.Connected ? <GreenText>Connected</GreenText>
          : connectionStatus === ConnectionStatus.Disconnected ? <RedText>Disconnected</RedText>
            : <RedText>{errorMsg}</RedText>
      }
    </Typography>
  )
}

const GreenText = styled(`span`)(({theme}) => ({
  color: theme.palette.mode === "light" ? `#00ff00` : `#35ff35`,
}));

const RedText = styled(`span`)(({theme}) => ({
  color: theme.palette.mode === "light" ? `#f00` : `#ff3535`,
}));
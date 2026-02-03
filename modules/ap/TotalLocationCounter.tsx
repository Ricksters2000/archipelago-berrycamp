import {FC} from "react";
import {LocationCount} from "../data/ap/countLocations";
import {Box, Fade, Typography} from "@mui/material";
import Image from "next/image";
import {getCelesteItemImageUrl} from "../fetch/dataApi";
import {useArchipelagoContext} from "../provide/ArchipelagoContext";
import {ConnectionStatus} from "../data/ConnectionStatus";
import {logicColorKey} from "../data/ap/logicColorKey";
import {LogicStatus} from "../data/ap/logicHandling";

interface Props {
  show: boolean;
  totalCount: LocationCount;
}

export const TotalLocationCounter: FC<Props> = ({totalCount, show}) => {
  const {connectionStatus} = useArchipelagoContext();
  const {checked, accessible, total} = totalCount;
  if (connectionStatus !== ConnectionStatus.Connected) return null;
  return (
    <Fade in={show}>
      <Box
        display={`flex`}
        justifyContent={`space-between`}
        alignItems={`flex-start`}
        position={`absolute`}
        width={`100%`}
        height={`100%`}
        padding={1}
        zIndex={1}
      >
        {checked === total && (
          <Image src={getCelesteItemImageUrl(`fullClear`)} alt="Full Clear" objectFit="contain" height={40} width={40} />
        )}
        <Typography
          fontSize={24}
          fontWeight={700}
          padding={.5}
          marginLeft={`auto`}
          width={`fit-content`}
          textAlign={`right`}
          style={{color: `#fff`}}
          bgcolor={`#0000006e`}
          borderRadius={1}
        >
          <span style={{color: logicColorKey[LogicStatus.Checked]}}>{checked}</span>
          /
          <span style={{color: logicColorKey[LogicStatus.Accessible]}}>{accessible}</span>
          /
          <span>{total}</span>
        </Typography>
      </Box>
    </Fade>
  )
}
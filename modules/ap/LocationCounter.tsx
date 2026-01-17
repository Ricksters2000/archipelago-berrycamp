import {FC} from "react";
import {LocationType} from "../data/ap/apLocationData";
import {LocationCount} from "../data/countLocations";
import {Grid2, Stack, Typography} from "@mui/material";
import Image from "next/image";
import {getCelesteItemImageUrl} from "../fetch/dataApi";

interface Props {
  type: LocationType;
  locationCount: LocationCount;
}

export const LocationCounter: FC<Props> = ({type, locationCount}) => {
  return (
    <Grid2>
      <Stack component={`span`} spacing={1} direction={`row`} alignItems={`center`}>
        <Image
          src={getCelesteItemImageUrl(type)}
          alt={`${type}`}
          width={24}
          height={24}
          objectFit={type === `binoculars` ? `none` : `contain`}
          objectPosition={type === `binoculars` ? `bottom` : undefined}
        />
        <Typography>{`${locationCount.checked}/${locationCount.total}`}</Typography>
      </Stack>
    </Grid2>
  )
}
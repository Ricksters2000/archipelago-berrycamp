import {FC} from "react";
import {LocationType} from "../data/apLocationData";
import {LocationCount} from "../data/countLocations";
import {Grid2, ListItem, ListItemText, Typography} from "@mui/material";

interface Props {
  type: LocationType;
  locationCount: LocationCount;
}

export const LocationCounter: FC<Props> = ({type, locationCount}) => {
  return (
    <Grid2>
      <Typography>{`${locationCount.checked}/${locationCount.total}`}</Typography>
    </Grid2>
  )
}
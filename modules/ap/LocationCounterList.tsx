import {FC} from "react";
import {FullLocationCount, LocationCount} from "../data/countLocations";
import {Fade, Grid2} from "@mui/material";
import {LocationCounter} from "./LocationCounter";

interface Props {
  show: boolean;
  fullLocationCount: FullLocationCount;
}

export const LocationCounterList: FC<Props> = ({show, fullLocationCount}) => {
  return (
    <Fade in={show}>
      <Grid2
        columnSpacing={2}
        rowSpacing={1}
        container
        direction={`column`}
        padding={1}
        sx={{
          backgroundColor: `rgba(17, 17, 17, 0.8)`,
          position: `absolute`,
          width: '100%',
          height: '100%',
        }}
      >
        {fullLocationCount.levelClear.total > 0 && (
          <LocationCounter type="levelClear" locationCount={fullLocationCount.levelClear} />
        )}
        {fullLocationCount.heart.total > 0 && (
          <LocationCounter type="heart" locationCount={fullLocationCount.heart} />
        )}
        {fullLocationCount.golden.total > 0 && (
          <LocationCounter type="golden" locationCount={fullLocationCount.golden} />
        )}
        {fullLocationCount.cassette.total > 0 && (
          <LocationCounter type="cassette" locationCount={fullLocationCount.cassette} />
        )}
        {fullLocationCount.checkpoints.total > 0 && (
          <LocationCounter type="checkpoint" locationCount={fullLocationCount.checkpoints} />
        )}
        {fullLocationCount.cars.total > 0 && (
          <LocationCounter type="Car" locationCount={fullLocationCount.cars} />
        )}
        {fullLocationCount.keys.total > 0 && (
          <LocationCounter type="key" locationCount={fullLocationCount.keys} />
        )}
        {fullLocationCount.gems.total > 0 && (
          <LocationCounter type="gem" locationCount={fullLocationCount.gems} />
        )}
        {fullLocationCount.binoculars.total > 0 && (
          <LocationCounter type="binoculars" locationCount={fullLocationCount.binoculars} />
        )}
        {fullLocationCount.strawberries.total > 0 && (
          <LocationCounter type="berry" locationCount={fullLocationCount.strawberries} />
        )}
        {fullLocationCount.rooms.total > 0 && (
          <LocationCounter type="room" locationCount={fullLocationCount.rooms} />
        )}
      </Grid2>
    </Fade>
  )
}
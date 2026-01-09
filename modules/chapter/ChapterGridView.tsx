import {Map} from "@mui/icons-material";
import {Box, Button, Card, CardActionArea, CardActions, CardMedia, Container, Grid, ImageListItemBar} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import {FC, useState} from "react";
import {AspectBox} from "../common/aspectBox/AspectBox";
import {Checkpoint, Side} from "../data/dataTypes";
import {getCheckedAndTotalLocationsForSide} from "../data/countLocations";
import {createBlankSide, LevelLocations, useArchipelagoContext} from "../provide/ArchipelagoContext";
import {sideIdToIndex} from "../common/levelIdToIndex";
import {LocationCounterList} from "../ap/LocationCounterList";

export interface ChapterViewItemProps {
  chapterIndex: number;
  id: string;
  name: string;
  roomCount: number;
  checkpoints: Checkpoint[];
  rooms: Side[`rooms`];
  href: string;
  src: string;
}

export interface ChapterViewProps {
  sides: Array<ChapterViewItemProps>
}

export const ChapterGridView: FC<ChapterViewProps> = ({sides}) => {
  return (
    <Grid container spacing={1} pb={1} alignSelf="center">
      {sides.map(side => <ChapterGridViewItem {...side} key={side.name} />)}
    </Grid>
  );
}

const ChapterGridViewItem: FC<ChapterViewItemProps> = (props) => {
  const [showCheckedLocations, setShowCheckedLocations] = useState(false);
  const {chapterIndex, id, name, roomCount, href, src} = props;
  const {checkedLocations, randomizerOptions} = useArchipelagoContext();
  let sideCheckedLocations: LevelLocations | undefined;
  const chapter = checkedLocations.area.celeste[chapterIndex];
  if (chapter) {
    sideCheckedLocations = chapter.sides[sideIdToIndex(id)];
  }
  if (!sideCheckedLocations) {
    sideCheckedLocations = createBlankSide();
  }
  const totalCounts = getCheckedAndTotalLocationsForSide(sideCheckedLocations, props, randomizerOptions);
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card component={Box} onMouseEnter={() => setShowCheckedLocations(true)} onMouseLeave={() => setShowCheckedLocations(false)}>
        <Link passHref href={href}>
          <CardActionArea
            sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%", width: "100%"}}
            style={{
              imageRendering: "pixelated",
            }}
          >
            <CardMedia component={AspectBox}>
              <Image
                unoptimized
                layout="fill"
                src={src}
                alt={`Thumbnail for side ${name}`}
                style={{
                  imageRendering: "pixelated",
                }}
              />
              <LocationCounterList show={showCheckedLocations} fullLocationCount={totalCounts} />
            </CardMedia>
            <ImageListItemBar
              title={`${name}`}
              subtitle={`${roomCount} rooms`}
              sx={{
                pr: 1,
                background: "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0))",
              }}
            />
          </CardActionArea>
        </Link>
        <CardActions sx={{p: 0}}>
          <Link passHref href={`/map${href}`}>
            <Button fullWidth variant="contained" endIcon={<Map />} size="medium">Level Map</Button>
          </Link>
        </CardActions>
      </Card>
    </Grid>
  );
}

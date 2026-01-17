import {Avatar, Box, Button, Chip, Container, Paper, styled, TextField, Typography} from "@mui/material";
import {GetStaticProps} from "next";
import {Fragment, useEffect, useState} from "react";
import {Area} from "~/modules/data/dataTypes";
import {fetchArea, getAPIconImageUrl, getRootImageUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {AreaProps, AreaView} from "./[areaId]";
import {CampPage} from "./_app";
import {useArchipelagoContext} from "~/modules/provide/ArchipelagoContext";
import {ConnectionStatus} from "~/modules/data/ConnectionStatus";
import {ConnectionDisplay} from "~/modules/ap/ConnectionDisplay";
import {localStorageAPUserKey, StoredAPUser} from "~/modules/data/ap/apStorageKeys";
import Image from "next/image";

export const HomePage: CampPage<AreaProps> = ({area, chapters}) => {
  const [host, setHost] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const {login, connectionStatus} = useArchipelagoContext()

  useEffect(() => {
    const apUserRaw = localStorage.getItem(localStorageAPUserKey);
    if (apUserRaw) {
      const apUser = JSON.parse(apUserRaw) as StoredAPUser;
      setHost(apUser.host);
      setName(apUser.name);
      if (apUser.password) setPassword(apUser.password);
    }
  }, [])

  const onSubmit = () => {
    login(host, name, password);
  }

  return (
    <Fragment>
      <CampHead
        description="Browse rooms from the video game Celeste"
        image={getRootImageUrl()}
      />
      <Container>
        <Paper elevation={2} sx={{padding: 2, mt: 2}}>
          <Box display="flex" gap={1}>
            <Container>
              <Typography component="div" variant="h6">
                Welcome to <Typography component="span" color="secondary" variant="h6">Berry Camp</Typography>!
              </Typography>
              <Typography marginTop={1}>
                Browse rooms from the video game Celeste and open them in-game with Everest.
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                pt={3}
              >
                <Chip
                  clickable
                  component="a"
                  href="https://github.com/berrycamp/berrycamp.github.io"
                  avatar={<Avatar src="https://github.com/berrycamp.png?size=64" />}
                  label="Berry Camp"
                />
                <Typography>was made by</Typography>
                <Chip
                  clickable
                  component="a"
                  href="https://github.com/wishcresp"
                  avatar={<Avatar src="https://github.com/wishcresp.png?size=64" />}
                  label="wishcresp"
                />
              </Box>
              <Box display={`flex`} alignItems={`center`} gap={1} marginTop={2}>
                <Image src={getAPIconImageUrl()} alt="Archipelago Icon" width={24} height={24} objectFit="contain" />
                <Typography variant="h6">
                  Connect to Archipelago on the right side!
                </Typography>
              </Box>
              <Typography>
                Once connected, hovering over the chapters and sides will show all checked locations.
              </Typography>
              <Typography>
                Checked locations will be marked <GrayText>grey</GrayText> and any locations not checked yet will be marked <GreenText>green</GreenText>.
              </Typography>
              <Typography>
                Locations are marked with an outline of a rectangle but this can be changed to be a filled rectangle in the options in the top right.
              </Typography>
            </Container>
            <Box display={`flex`} gap={1} flexDirection={`column`}>
              <TextField
                label="Host"
                value={host}
                placeholder="eg. archipelago.gg:38280"
                size="small"
                required
                onChange={(event) => setHost(event.target.value)}
              />
              <TextField
                label="Name"
                value={name}
                size="small"
                required
                onChange={(event) => setName(event.target.value)}
              />
              <TextField
                label="Password"
                value={password}
                size="small"
                onChange={(event) => setPassword(event.target.value)}
              />
              <Box display={`flex`} alignItems={`center`} gap={1}>
                <Button variant="outlined" loading={connectionStatus === ConnectionStatus.Connecting} onClick={onSubmit} disabled={!host || !name}>
                  Login
                </Button>
                <ConnectionDisplay />
              </Box>
            </Box>
          </Box>
        </Paper>
        <AreaView area={area} chapters={chapters} />
      </Container>
    </Fragment>
  )
};

export default HomePage;

export const getStaticProps: GetStaticProps<AreaProps> = async () => {
  const {id, name, desc, chapters}: Area = await fetchArea("celeste");

  return {
    props: {
      area: {id, name, desc},
      chapters: chapters.map(({id, gameId, chapterNo: no, name, sides}) => ({id, gameId, name, sides, ...(no && {no})})),
    },
  };
};

const GrayText = styled(`span`)(({theme}) => ({
  color: theme.palette.mode === "light" ? `#808080` : `#c2c2c2`,
}));

const GreenText = styled(`span`)(({theme}) => ({
  color: theme.palette.mode === "light" ? `#00af00` : `#35ff35`,
}));
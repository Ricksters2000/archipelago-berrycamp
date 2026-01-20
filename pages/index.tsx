import {Avatar, Box, Button, Chip, Collapse, Container, Paper, styled, TextField, Typography} from "@mui/material";
import ArrowDownIcon from "@mui/icons-material/ArrowDropDown";
import {GetStaticProps} from "next";
import {Fragment, useEffect, useState} from "react";
import {Area} from "~/modules/data/dataTypes";
import {fetchArea, fetchLogic, getAPIconImageUrl, getRootImageUrl} from "~/modules/fetch/dataApi";
import {CampHead} from "~/modules/head/CampHead";
import {AreaProps, AreaView} from "./[areaId]";
import {CampPage} from "./_app";
import {useArchipelagoContext} from "~/modules/provide/ArchipelagoContext";
import {ConnectionStatus} from "~/modules/data/ConnectionStatus";
import {ConnectionDisplay} from "~/modules/ap/ConnectionDisplay";
import {localStorageAPUserKey, StoredAPUser} from "~/modules/data/ap/apStorageKeys";
import Image from "next/image";
import {logicColorKey} from "~/modules/data/ap/logicColorKey";
import {LogicStatus} from "~/modules/data/ap/logicHandling";

export const HomePage: CampPage<AreaProps> = ({area, chapters, logic}) => {
  const [host, setHost] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [displayTrackerInfo, setDisplayTrackerInfo] = useState(false);
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
              <Box component={`span`} sx={{cursor: `pointer`}} display={`inline-flex`} gap={1}
                onMouseDown={() => setDisplayTrackerInfo(prev => !prev)}
              >
                <DropDownIcon rotate={displayTrackerInfo}><ArrowDownIcon /></DropDownIcon>
                <Typography>Tracker Color Key</Typography>
              </Box>
              <Collapse in={displayTrackerInfo}>
                <Typography>{`In grid view: `}
                  <span style={{color: logicColorKey[LogicStatus.Checked]}}>Checked</span>
                  {` / `}
                  <span style={{color: logicColorKey[LogicStatus.Accessible]}}>Reachable</span>
                  {` / `}
                  <span>Total</span>
                </Typography>
                <Typography>In interactive map:</Typography>
                <Typography><span style={{color: logicColorKey[LogicStatus.InAccessible]}}>Red</span> - Locations that are not reachable in logic</Typography>
                <Typography><span style={{color: logicColorKey[LogicStatus.Accessible]}}>Green</span> - Locations that are reachable in logic</Typography>
                <Typography><span style={{color: logicColorKey[LogicStatus.Checked]}}>Gray</span> - Locations that have already been checked</Typography>
                <Typography>
                  Locations are marked with an outline of a rectangle but this can be changed to be a filled rectangle in the options in the top right.
                </Typography>
              </Collapse>
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
        <AreaView area={area} chapters={chapters} logic={logic} />
      </Container>
    </Fragment>
  )
};

export default HomePage;

export const getStaticProps: GetStaticProps<AreaProps> = async () => {
  const {id, name, desc, chapters}: Area = await fetchArea("celeste");
  const logic = await fetchLogic();
  return {
    props: {
      area: {id, name, desc},
      chapters: chapters.map(({id, gameId, chapterNo: no, name, sides}) => ({id, gameId, name, sides, ...(no && {no})})),
      logic,
    },
  };
};

const DropDownIcon = styled(`span`)((props) => ({
  transform: props.rotate ? `rotate(180deg)` : `rotate(0deg)`,
  transition: `transform 150ms cubic-bezier(0.4, 0, 0.2, 1)`,
  height: `24px`,
}))
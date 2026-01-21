import {CssBaseline} from '@mui/material';
import {Layout} from 'modules/layout/Layout';
import {CampContextProvider} from 'modules/provide/CampContext';
import {CampPreferencesProvider} from 'modules/provide/CampPreferences';
import {CampThemeProvider} from 'modules/provide/CampTheme';
import {NextPage} from 'next';
import {AppProps} from 'next/app';
import '../styles/globals.css';
import {Client, ConnectedPacket, ConnectionOptions, ConnectionRefusedPacket, defaultConnectionOptions, ReceivedItemsPacket, RoomUpdatePacket} from 'archipelago.js';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {ArchipelagoContext, ChapterItems, CheckedLocations, createBlankChapter, createBlankSide, createEmptyPlayerInventory, defaultCheckedLocations, defaultRandomizerOptions, PlayerInventory, RandomizerOptions} from '~/modules/provide/ArchipelagoContext';
import {ConnectionStatus} from '~/modules/data/ConnectionStatus';
import {CelesteSlotData, SideId} from '~/modules/data/dataTypes';
import {useImmer} from 'use-immer';
import {getLocationDataFromAP, LocationData} from '~/modules/data/ap/apLocationData';
import {sessionStorageDateConnectedKey, StoredAPUser, localStorageAPUserKey} from '~/modules/data/ap/apStorageKeys';
import {getItemDataFromAP, ItemData} from '~/modules/data/ap/apItemData';

// Session will last 1 hour
const sessionIdleTimerInMs = 1000 * 60 * 60;

const App = ({Component, pageProps}: AppProps<GlobalCampProps>) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.NoConnection)
  const [errorMsg, setErrorMsg] = useState(``)
  const [randomizerOptions, setRandomizerOptions] = useState(defaultRandomizerOptions)
  const [checkedLocations, setCheckedLocations] = useImmer(defaultCheckedLocations)
  const [playerInventory, setPlayerInventory] = useImmer(createEmptyPlayerInventory())
  const client = useMemo(() => new Client(), [])
  const loginClient = useCallback((host: string, name: string, password: string = "") => {
    setConnectionStatus(ConnectionStatus.Connecting)
    const connOptions: Required<ConnectionOptions> = {...defaultConnectionOptions, password}
    client.login(host, name, `Celeste (Open World)`, connOptions)
      .then(() => {
        const apUser: StoredAPUser = {
          host,
          name,
          password
        }
        localStorage.setItem(localStorageAPUserKey, JSON.stringify(apUser));
        sessionStorage.setItem(sessionStorageDateConnectedKey, new Date().toISOString())
      })
      .catch(error => {
        setConnectionStatus(ConnectionStatus.Error)
      })
  }, [client]);

  useEffect(() => {
    const apUserRaw = localStorage.getItem(localStorageAPUserKey);
    const lastDateConnectedString = sessionStorage.getItem(sessionStorageDateConnectedKey);
    if (apUserRaw && lastDateConnectedString) {
      const currentDate = new Date();
      const lastDateConnected = new Date(lastDateConnectedString);
      const apUser = JSON.parse(apUserRaw) as StoredAPUser;
      if (currentDate.valueOf() - lastDateConnected.valueOf() < sessionIdleTimerInMs) {
        loginClient(apUser.host, apUser.name, apUser.password);
      }
    }
  }, [loginClient])

  useEffect(() => {
    if (!client) return
    const checkLocation = (checkedLocationsDraft: CheckedLocations, locationData: LocationData) => {
      let chapter = checkedLocationsDraft.area.celeste[locationData.location[0]]
      if (!chapter) {
        chapter = createBlankChapter()
        checkedLocationsDraft.area.celeste[locationData.location[0]] = chapter
      }
      let currentSide = chapter.sides[locationData.location[1]]
      if (!currentSide) {
        currentSide = createBlankSide()
        chapter.sides[locationData.location[1]] = currentSide
      }
      const roomId = locationData.location[2]
      switch (locationData.type) {
        case 'levelClear':
          currentSide.levelClear = true
          break
        case 'heart':
          currentSide.heart = true
          break
        case 'golden':
          currentSide.golden = true
          break
        case 'cassette':
          currentSide.cassette = true
          break
        case 'checkpoint':
          currentSide.checkpoints[roomId] = true
          break
        case 'car':
          currentSide.cars[roomId] = true
          break
        case 'key':
          currentSide.keys[roomId] = {
            ...currentSide.keys[roomId],
            [locationData.location[3]]: true,
          }
          break
        case 'gem':
          currentSide.gems[roomId] = true
          break
        case 'binoculars':
          currentSide.binoculars[roomId] = {
            ...currentSide.binoculars[roomId],
            [locationData.location[3]]: true,
          }
          break
        case 'berry':
          currentSide.strawberries[roomId] = {
            ...currentSide.strawberries[roomId],
            [locationData.location[3]]: true,
          }
          break
        case 'room':
          currentSide.rooms[roomId] = true
          break
      }
    }

    const receiveItem = (playerInventoryDraft: PlayerInventory, itemData: ItemData) => {
      const getOrCreateSide = (itemMap: ChapterItems, chapterId: number, sideId: SideId) => {
        let chapter = itemMap[chapterId];
        if (!chapter) {
          chapter = {}
          itemMap[chapterId] = chapter;
        }
        let side = chapter[sideId];
        if (!side) {
          side = {};
          chapter[sideId] = side;
        }
        return side;
      }

      switch (itemData.type) {
        case `checkpoints`:
          const checkpointSide = getOrCreateSide(playerInventoryDraft.checkpoints, itemData.chapterId, itemData.sideId);
          checkpointSide[itemData.roomId] = true;
          break;
        case `keys`:
          const keySide = getOrCreateSide(playerInventoryDraft.keys, itemData.chapterId, itemData.sideId);
          keySide[itemData.itemName] = true;
          break;
        case `gems`:
          const gemSide = getOrCreateSide(playerInventoryDraft.gems, itemData.chapterId, itemData.sideId);
          gemSide[itemData.itemName] = true;
          break;
        case `strawberry`:
          playerInventoryDraft.strawberry++;
          break;
        default:
          playerInventoryDraft[itemData.type] = true;
      }
      // the different types of clutters aren't actual items but they still appear in the rules in logic
      // so this will act as though the players have clutter as long as they have the required items to get them in chapter 3
      if (playerInventoryDraft.coins) {
        playerInventoryDraft.brownClutter = true;
      }
      if (playerInventoryDraft.dashRefills) {
        playerInventoryDraft.greenClutter = true;
      }
    }

    const onConnected = (packet: ConnectedPacket) => {
      setConnectionStatus(ConnectionStatus.Connected)
      // console.log(`Connected to archipelago`, packet, client)
      const slotData = packet.slot_data as CelesteSlotData
      const playerRandomizerOptions: RandomizerOptions = {
        activeLevels: slotData.active_levels,
        goalArea: slotData.goal_area,
        lockGoalArea: slotData.lock_goal_area === 1,
        strawberriesRequired: slotData.strawberries_required,
        checkpointSanity: slotData.checkpointsanity === 1,
        binoSanity: slotData.binosanity === 1,
        keySanity: slotData.keysanity === 1,
        gemSanity: slotData.gemsanity === 1,
        carSanity: slotData.carsanity === 1,
        roomSanity: slotData.roomsanity === 1,
        includeGoldens: slotData.include_goldens === 1,
        includeCore: slotData.include_core === 1,
        includeFarewell: slotData.include_farewell === 0 ? false : slotData.include_farewell === 1 ? 'empty-space' : 'farewell',
        includeBSides: slotData.include_b_sides === 1,
        includeCSides: slotData.include_c_sides === 1,
      }
      setRandomizerOptions(playerRandomizerOptions)
      if (packet.checked_locations.length > 0) {
        setCheckedLocations(draft => {
          packet.checked_locations.forEach(checked => {
            const locationData = getLocationDataFromAP(checked)
            checkLocation(draft, locationData)
          })
        })
      }
      if (client.items.received.length > 0) {
        setPlayerInventory(draft => {
          client.items.received.forEach(item => {
            const itemData = getItemDataFromAP(item.id)
            if (!itemData) return;
            receiveItem(draft, itemData)
          })
        })
      }
    }

    const onConnectionRefused = (packet: ConnectionRefusedPacket) => {
      setConnectionStatus(ConnectionStatus.Error)
      console.error(`Connection refused:`, packet)
      const errors = packet.errors
      if (errors && errors[0]) {
        setErrorMsg(errors[0])
      }
    }

    const onDisconnected = () => {
      setConnectionStatus(ConnectionStatus.Disconnected)
      setCheckedLocations({
        area: {celeste: []}
      })
      setPlayerInventory(createEmptyPlayerInventory())
    }

    const onRoomUpdate = (packet: RoomUpdatePacket) => {
      if (!packet.checked_locations) return;
      setCheckedLocations(draft => {
        if (!packet.checked_locations) return
        packet.checked_locations.forEach(checked => {
          const locationData = getLocationDataFromAP(checked)
          checkLocation(draft, locationData)
        })
      })
    }

    const onReceivedItems = (packet: ReceivedItemsPacket) => {
      setPlayerInventory(draft => {
        packet.items.forEach(item => {
          const itemData = getItemDataFromAP(item.item)
          if (!itemData) return;
          receiveItem(draft, itemData);
        })
      })
    }

    const socket = client.socket
    socket.on(`connected`, onConnected)
    socket.on(`connectionRefused`, onConnectionRefused)
    socket.on(`disconnected`, onDisconnected)
    socket.on(`roomUpdate`, onRoomUpdate)
    socket.on(`receivedItems`, onReceivedItems)

    return () => {
      socket.off(`connected`, onConnected)
      socket.off(`connectionRefused`, onConnectionRefused)
      socket.off(`disconnected`, onDisconnected)
      socket.off(`roomUpdate`, onRoomUpdate)
      socket.off(`receivedItems`, onReceivedItems)
    }
  }, [client, setCheckedLocations, setPlayerInventory])

  return (
    <ArchipelagoContext.Provider value={{
      client,
      connectionStatus,
      errorMsg,
      randomizerOptions,
      checkedLocations,
      playerInventory,
      login: loginClient,
    }}>
      <CampContextProvider>
        <CampThemeProvider>
          <CampPreferencesProvider>
            <CssBaseline />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CampPreferencesProvider>
        </CampThemeProvider>
      </CampContextProvider>
    </ArchipelagoContext.Provider>
  );
}

/**
 * Declare global props to pass through Component to all camp pages.
 */
export interface GlobalCampProps {}

/**
 * Any NextPage provided with global camp props.
 */
export type CampPage<P = {}, IP = P> = NextPage<P & GlobalCampProps, IP>;

export default App;

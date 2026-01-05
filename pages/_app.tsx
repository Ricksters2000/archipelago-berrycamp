import {CssBaseline} from '@mui/material';
import {Layout} from 'modules/layout/Layout';
import {CampContextProvider} from 'modules/provide/CampContext';
import {CampPreferencesProvider} from 'modules/provide/CampPreferences';
import {CampThemeProvider} from 'modules/provide/CampTheme';
import {NextPage} from 'next';
import {AppProps} from 'next/app';
import '../styles/globals.css';
import {Client, ConnectedPacket, ConnectionOptions, defaultConnectionOptions, RoomUpdatePacket} from 'archipelago.js';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {ArchipelagoContext, defaultCheckedLocations, defaultRandomizerOptions, RandomizerOptions} from '~/modules/provide/ArchipelagoContext';
import {ConnectionStatus} from '~/modules/data/ConnectionStatus';
import {CelesteSlotData} from '~/modules/data/dataTypes';

const App = ({Component, pageProps}: AppProps<GlobalCampProps>) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.NoConnection)
  const [randomizerOptions, setRandomizerOptions] = useState(defaultRandomizerOptions)
  const [checkedLocations, setCheckedLocations] = useState(defaultCheckedLocations)
  const client = useMemo(() => new Client(), [])
  const loginClient = useCallback((host: string, name: string, password: string = "") => {
    setConnectionStatus(ConnectionStatus.Connecting)
    const connOptions: Required<ConnectionOptions> = {...defaultConnectionOptions, password}
    client.login(host, name, `Celeste (Open World)`, connOptions)
  }, [client]);

  useEffect(() => {
    if (!client) return
    const socket = client.socket
    socket.on(`connected`, onConnected)
    socket.on(`disconnected`, onDisconnected)
    socket.on(`roomUpdate`, onRoomUpdate)

    return () => {
      socket.off(`connected`, onConnected)
      socket.off(`disconnected`, onDisconnected)
      socket.off(`roomUpdate`, onRoomUpdate)
    }
  }, [client])

  const onConnected = (packet: ConnectedPacket) => {
    setConnectionStatus(ConnectionStatus.Connected)
    console.log(`Connected to archipelago`, packet)
    const slotData = packet.slot_data as CelesteSlotData
    const playerRandomizerOptions: RandomizerOptions = {
      checkpointSanity: slotData.checkpointsanity === 1,
      binoSanity: slotData.binosanity === 1,
      keySanity: slotData.keysanity === 1,
      gemSanity: slotData.gemsanity === 1,
      carSanity: slotData.carsanity === 1,
      roomSanity: slotData.roomsanity === 1,
      includeGoldens: slotData.include_goldens === 1,
      includeCore: slotData.include_core === 1,
      includeFarewell: slotData.include_farewell === 0 ? false : slotData.include_farewell === 1 ? 'white-space' : 'farewell',
      includeBSides: slotData.include_b_sides === 1,
      includeCSides: slotData.include_c_sides === 1,
    }
    setRandomizerOptions(playerRandomizerOptions)
  }

  const onDisconnected = () => {
    setConnectionStatus(ConnectionStatus.Disconnected)
  }

  const onRoomUpdate = (packet: RoomUpdatePacket) => {
    if (!packet.checked_locations) return;
  }

  return (
    <ArchipelagoContext.Provider value={{
      client,
      connectionStatus,
      randomizerOptions,
      checkedLocations,
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

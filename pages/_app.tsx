import {CssBaseline} from '@mui/material';
import {Layout} from 'modules/layout/Layout';
import {CampContextProvider} from 'modules/provide/CampContext';
import {CampPreferencesProvider} from 'modules/provide/CampPreferences';
import {CampThemeProvider} from 'modules/provide/CampTheme';
import {NextPage} from 'next';
import {AppProps} from 'next/app';
import '../styles/globals.css';
import {Client, ConnectionOptions, defaultConnectionOptions} from 'archipelago.js';
import {useCallback, useMemo, useState} from 'react';
import {ArchipelagoContext} from '~/modules/provide/ArchipelagoContext';
import {ConnectionStatus} from '~/modules/data/ConnectionStatus';

const App = ({Component, pageProps}: AppProps<GlobalCampProps>) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.NoConnection)
  const client = useMemo(() => new Client(), [])
  const loginClient = useCallback((host: string, name: string, password: string = "") => {
    setConnectionStatus(ConnectionStatus.Connecting)
    const connOptions: Required<ConnectionOptions> = {...defaultConnectionOptions, password}
    client.login(host, name, `Celeste (Open World)`, connOptions).then(() => {
      setConnectionStatus(ConnectionStatus.Connected)
      console.log(`Connected to archipelago`, client.items, client.storage)
      const player = client.players.self
      player.fetchSlotData().then(slotData => {
        console.log(`slot data:`, slotData)
      })
    }).catch(error => {
      setConnectionStatus(ConnectionStatus.Disconnected)
      console.error(`Failed to connect:`, error)
    });
  }, [client]);
  return (
    <ArchipelagoContext.Provider value={{
      client,
      connectionStatus,
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

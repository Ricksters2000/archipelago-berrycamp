import {createContext, FC, PropsWithChildren, useCallback, useContext, useState} from "react";

export type CanvasDrawStyle = `fill` | `stroke`;

export interface ICampContext {
  settings: ICampSettings;
  changeTheme: () => void;
  setPrefersDark: (prefersDark: boolean) => void;
  toggleListMode: () => void;
  toggleEverest: () => void;
  setEverestUrl: (url?: string) => void;
  setSettings: (settings: ICampSettings) => void;
  setCheckedDrawStyle: (drawStyle: CanvasDrawStyle) => void;
  setUncheckedDrawStyle: (drawStyle: CanvasDrawStyle) => void;
}

export interface ICampSettings {
  theme?: "light" | "dark";
  prefersDark?: true;
  listMode?: true;
  everest: boolean;
  everestUrl?: string;
  checkedDrawStyle?: CanvasDrawStyle;
  uncheckedDrawStyle?: CanvasDrawStyle;
}

const CampContext = createContext<ICampContext>({
  settings: {
    everest: true,
    checkedDrawStyle: `stroke`,
    uncheckedDrawStyle: `stroke`,
  },
  changeTheme: () => undefined,
  setPrefersDark: () => undefined,
  toggleListMode: () => undefined,
  toggleEverest: () => undefined,
  setEverestUrl: () => undefined,
  setSettings: () => undefined,
  setCheckedDrawStyle: () => undefined,
  setUncheckedDrawStyle: () => undefined,
});

export const CampContextProvider: FC<PropsWithChildren> = ({children}) => {
  const [settings, setSettings] = useState<ICampSettings>({
    everest: true,
  });

  const changeTheme = useCallback(() => {
    setSettings(({theme, ...other}) => ({...other, ...(theme !== "dark" && {theme: theme === undefined ? "light" : "dark"})}));
  }, []);

  const setPrefersDark = useCallback((prefersDark: boolean) => {
    setSettings(({prefersDark: _, ...other}) => ({...other, ...(prefersDark && {prefersDark})}));
  }, []);

  const toggleListMode = useCallback(() => {
    setSettings(({listMode, ...other}) => ({...other, ...(!listMode && {listMode: true})}));
  }, [])

  const toggleEverest = useCallback(() => {
    setSettings(({everest, ...other}) => ({...other, everest: !everest}));
  }, []);

  const setEverestUrl = useCallback((everestUrl?: string) => {
    setSettings(({everestUrl: _, ...other}) => ({...other, ...(everestUrl !== undefined && {everestUrl})}));
  }, []);

  const setCheckedDrawStyle = useCallback((drawStyle: CanvasDrawStyle) => {
    setSettings((prev) => ({...prev, checkedDrawStyle: drawStyle}));
  }, []);

  const setUncheckedDrawStyle = useCallback((drawStyle: CanvasDrawStyle) => {
    setSettings((prev) => ({...prev, uncheckedDrawStyle: drawStyle}));
  }, []);

  return (
    <CampContext.Provider
      value={{
        settings,
        changeTheme,
        setPrefersDark,
        toggleListMode,
        toggleEverest,
        setEverestUrl,
        setSettings,
        setCheckedDrawStyle,
        setUncheckedDrawStyle,
      }}
    >
      {children}
    </CampContext.Provider>
  )
}

export const useCampContext = (): ICampContext => {
  return useContext<ICampContext>(CampContext)
}
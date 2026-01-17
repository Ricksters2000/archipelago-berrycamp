import {FC, Fragment, PropsWithChildren, useEffect} from "react";
import {CanvasDrawStyle, ICampSettings, useCampContext} from "./CampContext";

const THEME_KEY = "theme";
const LIST_MODE_KEY = "listMode";
const EVEREST_URL_KEY = "everestUrl";
const CHECKED_DRAW_STYLE_KEY = "checkedDrawStyle";
const UNCHECKED_DRAW_STYLE_KEY = "unCheckedDrawStyle";

export const CampPreferencesProvider: FC<PropsWithChildren> = ({children}) => {
  const {settings, setSettings} = useCampContext();

  /**
  * Retrieve and validate user settings from localstorage.
  */
  useEffect(() => {
    const storageSettings: ICampSettings = {
      everest: !/Mobi/i.test(navigator.userAgent),
    };

    const theme: string | null = localStorage.getItem(THEME_KEY);
    if (theme !== null) {
      storageSettings.theme = theme === "dark" ? "dark" : "light";
    }

    const listMode: string | null = localStorage.getItem(LIST_MODE_KEY);
    if (listMode !== null) {
      storageSettings.listMode = true;
    }

    const url: string | null = localStorage.getItem(EVEREST_URL_KEY);
    if (url !== null) {
      storageSettings.everestUrl = url;
    }

    const checkedDrawStyle = localStorage.getItem(CHECKED_DRAW_STYLE_KEY) as CanvasDrawStyle | null;
    if (checkedDrawStyle !== null) {
      storageSettings.checkedDrawStyle = checkedDrawStyle;
    }

    const uncheckedDrawStyle = localStorage.getItem(UNCHECKED_DRAW_STYLE_KEY) as CanvasDrawStyle | null;
    if (uncheckedDrawStyle !== null) {
      storageSettings.uncheckedDrawStyle = uncheckedDrawStyle;
    }

    setSettings(storageSettings);
  }, [setSettings]);

  /**
   * Set user settings in localstorage.
   */
  useEffect(() => {
    [THEME_KEY, LIST_MODE_KEY, EVEREST_URL_KEY].forEach(key => localStorage.removeItem(key));

    const {theme, listMode, everest, everestUrl, checkedDrawStyle, uncheckedDrawStyle} = settings;

    if (theme !== undefined) {
      localStorage.setItem(THEME_KEY, theme);
    }

    if (listMode) {
      localStorage.setItem(LIST_MODE_KEY, String(true));
    }

    if (everestUrl !== undefined) {
      localStorage.setItem(EVEREST_URL_KEY, String(everestUrl));
    }

    if (checkedDrawStyle) {
      localStorage.setItem(CHECKED_DRAW_STYLE_KEY, checkedDrawStyle);
    }

    if (uncheckedDrawStyle) {
      localStorage.setItem(UNCHECKED_DRAW_STYLE_KEY, uncheckedDrawStyle);
    }
  }, [settings]);

  return (
    <Fragment>
      {children}
    </Fragment>
  )
}
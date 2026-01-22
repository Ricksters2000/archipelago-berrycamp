import {Fullscreen} from "@mui/icons-material";
import {Box, debounce, IconButton, ListItemText, Menu, MenuItem, Theme, useTheme} from "@mui/material";
import {calculateCanvasPosition, calculateCanvasView, ExtentCanvasArgs, ExtentCanvasPoint, ExtentCanvasView, ExtentCanvasViewBox, useExtentCanvas} from "extent-canvas";
import {NextRouter, useRouter} from "next/router";
import {FC, memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {CanvasDrawStyle, useCampContext} from "../provide/CampContext";
import {CampCanvasProps} from "./types";
import {createBlankSide, LevelLocations, useArchipelagoContext} from "../provide/ArchipelagoContext";
import {chapterIdToIndex, sideIdToIndex} from "../common/levelIdToIndex";
import {getCelesteItemImageUrl, getCollectedCelesteItemImageUrl} from "../fetch/dataApi";
import {ConnectionStatus} from "../data/ConnectionStatus";
import {LogicStatus} from "../data/ap/logicHandling";
import {logicColorKey} from "../data/ap/logicColorKey";
import {isChapterIndexFarewell, shouldIncludeFarewellRoom} from "../data/farewellUtils";
import {includeLevelInTracker} from "../data/ap/includeLevelInTracker";

type CollectedItemImageKey = `ghostBerry` | `ghostCassette` | `ghostHeart` | `ghostGolden` | `levelClear` | `golden` | `strawberry` | `heart`;

export const CampCanvas: FC<CampCanvasProps> = memo(({
  view,
  rooms,
  checkpoints,
  imagesRef,
  contentViewRef,
  logicData,
  onViewChange,
  onTeleport,
  onSelectRoom,
}) => {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const {settings} = useCampContext();
  const {everest, checkedDrawStyle, uncheckedDrawStyle} = settings;
  const {checkedLocations, randomizerOptions, connectionStatus} = useArchipelagoContext();

  const router: NextRouter = useRouter();

  const theme: Theme = useTheme();
  const background = theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200];

  const ref = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<ExtentCanvasView | undefined>();
  const viewBoxRef = useRef<ExtentCanvasViewBox | undefined>();
  const collectedItemImagesRef = useRef<Record<CollectedItemImageKey, CanvasImageSource | undefined>>({
    ghostBerry: undefined,
    ghostGolden: undefined,
    ghostCassette: undefined,
    ghostHeart: undefined,
    levelClear: undefined,
    golden: undefined,
    strawberry: undefined,
    heart: undefined,
  })

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number,
    mouseY: number,
    x: number,
    y: number,
  } | null>(null);

  const {areaId, chapterId, sideId} = router.query;
  const updateViewParams = useRef<() => void>(debounce(() => {
    if (viewBoxRef.current === undefined) {
      return;
    }

    router.replace({query: {areaId, chapterId, sideId, ...viewBoxRef.current}}, undefined, {shallow: true})
  }, 150));

  // This is to prevent the view from snapping to a previous position on every location checked
  const firstLoad = useRef(true);
  const preventUpdateView = useRef(false);
  const sideCheckedLocations = useMemo(() => {
    let sideCheckedLocations: LevelLocations | undefined;
    if (typeof chapterId === `string`) {
      const chapterChecks = checkedLocations.area.celeste[chapterIdToIndex(chapterId)];
      if (typeof sideId === `string`) {
        const sideIndex = sideIdToIndex(sideId);
        sideCheckedLocations = chapterChecks?.sides[sideIndex];
      }
    }
    if (!sideCheckedLocations) {
      sideCheckedLocations = createBlankSide();
    }
    return sideCheckedLocations;
  }, [chapterId, checkedLocations.area.celeste, sideId])

  useEffect(() => {
    preventUpdateView.current = true;
  }, [sideCheckedLocations, uncheckedDrawStyle, checkedDrawStyle, connectionStatus, logicData])

  /**
   * Set the current view.
   */
  const handleViewBoxChange: Exclude<ExtentCanvasArgs["onViewBoxChange"], undefined> = useCallback((view, reason) => {
    if (reason !== "set") {
      updateViewParams.current();
    }

    viewBoxRef.current = view;
    onViewChange(reason);
  }, [onViewChange]);

  const handleViewChange: Exclude<ExtentCanvasArgs["onViewChange"], undefined> = useCallback((view) => {
    viewRef.current = view;
  }, [])

  /**
   * Handle canvas customization.
   */
  const handleBeforeDraw: Exclude<ExtentCanvasArgs["onBeforeDraw"], undefined> = useCallback((context) => {
    if (viewRef.current === undefined) {
      return;
    }

    // Sharp images.
    context.imageSmoothingEnabled = viewRef.current.scale <= 1;
    // Hide edge seams.
    context.globalCompositeOperation = "lighter";
  }, []);

  /**
   * Draw images to the canvas
   */
  const handleDraw = useCallback((context: CanvasRenderingContext2D) => {
    if (ref.current === null) {
      return;
    }

    contentViewRef.current = undefined;

    let isFarewell = false;
    let includeLevel = true;
    if (typeof chapterId === `string` && typeof sideId === `string`) {
      const chapterIndex = chapterIdToIndex(chapterId);
      isFarewell = isChapterIndexFarewell(chapterIndex);
      includeLevel = includeLevelInTracker(chapterIndex, sideId, randomizerOptions);
    }

    /**
     * Load new rooms.
     */
    rooms.forEach(({id, image, entities, position, view, hideInTracker}, i) => {
      const getRoomPos = (offset?: {x: number, y: number}) => {
        const loadedImage = imagesRef.current[i];
        let pos = position;
        if (loadedImage) {
          pos = loadedImage.position;
        }
        if (offset) {
          return {x: pos.x + offset.x, y: pos.y + offset.y};
        }
        return pos;
      }
      const drawCollectedItemImage = (key: CollectedItemImageKey, imageSrc: string, cb: (img: CanvasImageSource) => void) => {
        const loadedImage = collectedItemImagesRef.current[key];
        context.globalCompositeOperation = `source-over`;
        if (loadedImage) {
          cb(loadedImage);
        } else {
          const img = new Image();
          img.src = imageSrc;
          collectedItemImagesRef.current[key] = img;
          img.onload = () => {
            cb(img);
          };
        }
        context.globalCompositeOperation = `lighter`;
      }
      if (viewBoxRef.current === undefined) {
        return;
      }
      const drawMarkedItemOnPos = (logicStatus: LogicStatus = LogicStatus.InAccessible, x: number, y: number, width: number, height: number, forceDrawStyle?: CanvasDrawStyle) => {
        context.globalCompositeOperation = `lighter`;
        let drawStyle;
        const color = logicColorKey[logicStatus];
        context.fillStyle = color;
        context.strokeStyle = color;
        if (logicStatus === LogicStatus.Checked) {
          drawStyle = checkedDrawStyle;
        } else {
          drawStyle = uncheckedDrawStyle;
        }
        if (forceDrawStyle) drawStyle = forceDrawStyle;
        if (drawStyle === `fill`) {
          context.fillRect(x - 1, y - 1, width + 2, height + 2);
        } else {
          context.strokeRect(x, y, width, height);
        }
      }

      // Don't render if not in view.
      const inView: boolean = viewsCollide(view, viewBoxRef.current);
      if (!inView) {
        return;
      }

      if (contentViewRef.current === undefined) {
        contentViewRef.current = {
          top: Math.max(view.top, viewBoxRef.current.top),
          bottom: Math.min(view.bottom, viewBoxRef.current.bottom),
          left: Math.max(view.left, viewBoxRef.current.left),
          right: Math.min(view.right, viewBoxRef.current.right),
        };
      }
      if (contentViewRef.current.top > view.top) {
        contentViewRef.current.top = Math.max(view.top, viewBoxRef.current.top)
      }
      if (contentViewRef.current.bottom < view.bottom) {
        contentViewRef.current.bottom = Math.min(view.bottom, viewBoxRef.current.bottom)
      }
      if (contentViewRef.current.left > view.left) {
        contentViewRef.current.left = Math.max(view.left, viewBoxRef.current.left)
      }
      if (contentViewRef.current.right < view.right) {
        contentViewRef.current.right = Math.min(view.right, viewBoxRef.current.right)
      }

      const loadedImage: CanvasImage | undefined = imagesRef.current[i];
      if (loadedImage) {
        const {img, position: {x, y}} = loadedImage;
        context.drawImage(img, x, y);
      } else {
        const img = new Image();
        img.src = image;
        imagesRef.current[i] = {img, position, view};
        img.onload = () => {
          context.drawImage(img, position.x, position.y);
        }
      }
      // Display checked and unchecked locations if connected
      if (connectionStatus !== ConnectionStatus.Connected) return;
      if (!includeLevel) return;
      if (isFarewell) {
        if (!shouldIncludeFarewellRoom(id, randomizerOptions)) return;
      }
      context.lineWidth = 2;
      const checkedBerries = sideCheckedLocations.strawberries[id]
      if (entities.berry) {
        drawCollectedItemImage(`ghostBerry`, getCollectedCelesteItemImageUrl(`ghostBerry`), (img) => {
          if (!entities.berry) return;
          for (const berry of entities.berry) {
            const pos = getRoomPos(berry)
            if (checkedBerries && checkedBerries[berry.id]) {
              context.drawImage(img, pos.x - 8, pos.y - 8)
            } else {
              const logicStatus = logicData.strawberries[id]?.[berry.logicName];
              if (berry.manualDisplayInTracker) {
                drawCollectedItemImage(`strawberry`, getCelesteItemImageUrl(`berry`), (img) => {
                  context.drawImage(img, pos.x - 8, pos.y - 8)
                  drawMarkedItemOnPos(logicStatus, pos.x - 5, pos.y - 5, 10, 10);
                })
              } else {
                drawMarkedItemOnPos(logicStatus, pos.x - 5, pos.y - 5, 10, 10);
              }
            }
          }
        })
      }
      const checkedKeys = sideCheckedLocations.keys[id]
      if (entities.key) {
        for (const key of entities.key) {
          const pos = getRoomPos(key)
          let logicStatus = logicData.keys[id]?.[key.logicName];
          if (checkedKeys?.[key.id]) logicStatus = LogicStatus.Checked;
          drawMarkedItemOnPos(logicStatus, pos.x - 7, pos.y - 7, 12, 12)
        }
      }
      const checkedBinoculars = sideCheckedLocations.binoculars[id]
      if (entities.binoculars && randomizerOptions.binoSanity) {
        for (const binoculars of entities.binoculars) {
          const pos = getRoomPos(binoculars)
          let logicStatus = logicData.binoculars[id]?.[binoculars.logicName];
          if (checkedBinoculars?.[binoculars.id]) logicStatus = LogicStatus.Checked;
          drawMarkedItemOnPos(logicStatus, pos.x - 6, pos.y - 15, 11, 15)
        }
      }
      if (entities.car && randomizerOptions.carSanity) {
        const car = entities.car[0]
        if (car) {
          const pos = getRoomPos(car)
          let logicStatus = logicData.cars[id];
          if (sideCheckedLocations.cars[id]) logicStatus = LogicStatus.Checked;
          drawMarkedItemOnPos(logicStatus, pos.x - 22, pos.y - 16, 46, 16)
        }
      }
      if (entities.cassette) {
        const cassette = entities.cassette[0]
        if (cassette) {
          const pos = getRoomPos(cassette);
          if (sideCheckedLocations.cassette) {
            drawCollectedItemImage(`ghostCassette`, getCollectedCelesteItemImageUrl(`ghostCassette`), img => {
              context.drawImage(img, pos.x - 16, pos.y - 16)
            })
          } else {
            drawMarkedItemOnPos(logicData.cassette, pos.x - 10, pos.y - 8, 20, 14)
          }
        }
      }
      if (entities.golden && randomizerOptions.includeGoldens) {
        const golden = entities.golden[0]
        if (golden) {
          const pos = getRoomPos(golden);
          if (sideCheckedLocations.golden) {
            drawCollectedItemImage(`ghostGolden`, getCollectedCelesteItemImageUrl(`ghostGolden`), img => {
              context.drawImage(img, pos.x - 8, pos.y - 8);
            })
          } else {
            drawCollectedItemImage(`golden`, getCelesteItemImageUrl(`golden`), img => {
              context.drawImage(img, pos.x - 8, pos.y - 8);
              drawMarkedItemOnPos(logicData.golden, pos.x - 5, pos.y - 6, 12, 12);
            })
          }
        }
      }
      if (entities.heart) {
        const heart = entities.heart[0]
        if (heart) {
          const pos = getRoomPos(heart);
          // The hearts aren't tracked for B and C sides but completing the level is basically getting the heart in their
          if (sideCheckedLocations.heart || sideId !== `a` && sideCheckedLocations.levelClear) {
            drawCollectedItemImage(`ghostHeart`, getCollectedCelesteItemImageUrl(`ghostHeart`), img => {
              context.drawImage(img, pos.x - 10, pos.y - 9);
            })
          } else {
            let logicStatus = logicData.heart;
            if (sideId !== `a`) {
              logicStatus = logicData.levelClear;
            }
            if (heart.manualDisplayInTracker) {
              drawCollectedItemImage(`heart`, getCelesteItemImageUrl(`heart`), (img) => {
                context.drawImage(img, pos.x - 10, pos.y - 9);
                drawMarkedItemOnPos(logicStatus, pos.x - 8, pos.y - 8, 16, 16);
              })
            } else {
              drawMarkedItemOnPos(logicStatus, pos.x - 8, pos.y - 8, 16, 16);
            }
          }
        }
      }
      if (entities.gem) {
        const gem = entities.gem[0]
        if (gem) {
          const pos = getRoomPos(gem)
          let logicStatus = logicData.gems[id];
          if (sideCheckedLocations.gems[id]) logicStatus = LogicStatus.Checked;
          drawMarkedItemOnPos(logicStatus, pos.x - 11, pos.y - 11, 22, 22)
        }
      }
      if (entities.checkpoint) {
        const checkpoint = entities.checkpoint[0]
        if (checkpoint) {
          const pos = getRoomPos(checkpoint)
          let logicStatus = logicData.checkpoints[id];
          if (sideCheckedLocations.checkpoints[id]) logicStatus = LogicStatus.Checked;
          drawMarkedItemOnPos(logicStatus, pos.x - 10, pos.y - 23, 20, 23)
        }
      }
      let lastRoomId = ``;
      const roomOrder = checkpoints[checkpoints.length - 1]?.roomOrder;
      if (roomOrder) {
        lastRoomId = roomOrder[roomOrder.length - 1] ?? ``;
      }
      // Since getting the heart is essentially a level clear for B and C sides then this doesn't need to show for them
      // Maybe later on this can be displayed for the other sides when the flag is shown in the top right corner instead of left.
      if (id === lastRoomId && sideCheckedLocations.levelClear && sideId === `a`) {
        drawCollectedItemImage(`levelClear`, getCelesteItemImageUrl(`levelClear`), img => {
          context.drawImage(img, position.x, position.y)
        })
      }
      if (!hideInTracker && randomizerOptions.roomSanity) {
        const width = view.right - view.left
        const height = view.bottom - view.top
        let logicStatus = logicData.rooms[id];
        if (sideCheckedLocations.rooms[id]) logicStatus = LogicStatus.Checked;
        drawMarkedItemOnPos(logicStatus, position.x + 1, position.y + 1, width - 2, height - 2, `stroke`)
      }
    });
  }, [contentViewRef, imagesRef, rooms, checkpoints, checkedDrawStyle, uncheckedDrawStyle, sideId, sideCheckedLocations, randomizerOptions, connectionStatus, logicData, chapterId]);

  const {setViewBox, draw} = useExtentCanvas({
    ref,
    onContextInit: setContext,
    onBeforeDraw: handleBeforeDraw,
    onDraw: handleDraw,
    onViewBoxChange: handleViewBoxChange,
    onViewChange: handleViewChange,
    minScale: 0.01,
    maxScale: 64,
  });

  /**
   * Close the context menu;
   */
  const handleClose = () => {
    setContextMenu(null);
  }

  /**
   * Teleport and close the context menu.
   */
  const handleTeleport = () => {
    if (contextMenu) {
      onTeleport(contextMenu.x, contextMenu.y);
    }
    handleClose();
  };

  /**
   * Find the room and close the context menu.
   */
  const handleSelectRoom = () => {
    if (contextMenu) {
      onSelectRoom(contextMenu.x, contextMenu.y);
    }
    handleClose();
  };

  const handleFullscreen = () => {
    void ref.current?.requestFullscreen();
  }

  /**
   * Add a listener for context menu right clicks.
   */
  useEffect(() => {
    if (context === null) {
      return;
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (viewRef.current === undefined) {
        return;
      }

      const {clientX, clientY} = event;
      const {top, left} = context.canvas.getBoundingClientRect();
      const {x, y} = calculateCanvasPosition(viewRef.current, clientX - left, clientY - top);

      setContextMenu({mouseX: clientX + 2, mouseY: clientY - 6, x, y});
    }

    context.canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      context.canvas.removeEventListener("contextmenu", handleContextMenu);
    }
  }, [context]);

  /**
 * Redraw the canvas on resize.
 */
  useEffect(() => {
    if (context === null || context.canvas.parentElement === null) {
      return;
    }

    /**
     * Resize the canvas, draw the current view to an offscreen canvas and copy it back after resize
     * to reduce flicker.
     * 
     * @param entries The resize observer entries.
     */
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (viewBoxRef.current === undefined) {
        return;
      }

      const tempCanvas: HTMLCanvasElement = document.createElement("canvas");
      const tempContext: CanvasRenderingContext2D = tempCanvas.getContext("2d", {alpha: true}) as CanvasRenderingContext2D;
      if (context.canvas.width > 0 && context.canvas.height > 0) {
        tempContext.drawImage(context.canvas, 0, 0);
      }

      const isFullscreen: boolean = Boolean(document.fullscreenElement);
      const entry: ResizeObserverEntry | undefined = entries[0];
      if (isFullscreen) {
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerHeight;
      } else if (entry) {
        context.canvas.width = entry.contentRect.width;
        context.canvas.height = entry.contentRect.height;
      }

      if (context.canvas.width > 0 && context.canvas.height > 0) {
        const {offset} = calculateCanvasView(tempContext.canvas, viewBoxRef.current);
        context.drawImage(tempContext.canvas, offset.x, offset.y);
      }
      draw();
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(context.canvas);

    // Set the initial size.
    const {width, height} = context.canvas.getBoundingClientRect();
    context.canvas.width = width;
    context.canvas.height = height;

    return () => {
      observer.disconnect();
    }
  }, [context, draw]);

  /**
   * Initialise the room image array.
   */
  useEffect(() => {
    imagesRef.current = [];
  }, [imagesRef, rooms]);

  /**
   * Update the view. Waits for the context to be ready before drawing.
   */
  useEffect(() => {
    if (view === undefined || context === null) {
      return;
    }
    if (!firstLoad.current && preventUpdateView.current) {
      preventUpdateView.current = false;
      return;
    } else {
      firstLoad.current = false;
    }
    setViewBox(view);
    viewRef.current = calculateCanvasView(context.canvas, view);
    viewBoxRef.current = view;
  }, [context, setViewBox, view]);

  return (
    <Box position="relative" width="100%" height="100%">
      <Menu
        open={Boolean(contextMenu)}
        onClose={handleClose}
        anchorReference="anchorPosition"
        {...contextMenu && {anchorPosition: {top: contextMenu.mouseY, left: contextMenu.mouseX}}}
        onContextMenu={event => {
          event.preventDefault();
          handleClose();
        }}
      >
        <MenuItem onClick={handleSelectRoom}>
          <ListItemText>Select room</ListItemText>
        </MenuItem>
        {everest && (
          <MenuItem onClick={handleTeleport}>
            <ListItemText>Teleport here</ListItemText>
          </MenuItem>
        )}
      </Menu>
      <canvas
        ref={ref}
        style={{
          background,
          position: "relative",
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
          touchAction: "none",
        }}
      />
      <IconButton
        color="primary"
        size="small"
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          zIndex: 1,
        }}
        onClick={handleFullscreen}
      >
        <Fullscreen />
      </IconButton>
    </Box>
  );
});

export const CAMP_CANVAS_CHANNEL = "campcanvas" as const;

/**
 * Determine if two views collide.
 * 
 * @param v1 The first view.
 * @param v2 The second view.
 * @returns True if v1 and v2 collide.
 */
export const viewsCollide = (v1: ExtentCanvasViewBox, v2: ExtentCanvasViewBox): boolean => {
  return v1.left < v2.right && v1.right > v2.left && v1.top < v2.bottom && v1.bottom > v2.top;
}

export interface CanvasImage {
  img: CanvasImageSource;
  position: ExtentCanvasPoint;
  view: ExtentCanvasViewBox;
}

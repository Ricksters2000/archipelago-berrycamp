import {ExtentCanvasPoint, ExtentCanvasViewBox, ExtentCanvasViewChangeReason} from "extent-canvas";
import {MutableRefObject} from "react";
import {CanvasImage} from "./CampCanvas";
import {Entities} from "../data/dataTypes";
import {CheckpointData} from "../map";

export interface CampCanvasProps {
  view: ExtentCanvasViewBox | undefined;
  rooms: CanvasRoom[];
  checkpoints: CheckpointData[];
  imagesRef: MutableRefObject<CanvasImage[]>;
  contentViewRef: MutableRefObject<ExtentCanvasViewBox | undefined>;
  onViewChange: (reason: ExtentCanvasViewChangeReason) => void;
  onSelectRoom: (x: number, y: number) => void;
  onTeleport: (x: number, y: number) => void;
}

export interface CanvasRoom {
  id: string;
  position: ExtentCanvasPoint;
  view: ExtentCanvasViewBox;
  image: string;
  entities: Partial<Entities>;
}

import {LogicLocationType, RawLogicLevel, RawLogicRegion, RawLogicRoom, Rules} from "./logicHandling";

interface Location {
  name: string;
  id?: string | number;
  type: LogicLocationType;
  rules: Rules;
}

interface NodeConnection {
  child: RegionNode;
  rules: Rules;
}

export class RegionNode {
  name: string;
  connections: Array<NodeConnection>;
  locations: Array<Location>;

  constructor(public roomId: string, region: RawLogicRegion, public checkpoint?: string) {
    this.name = region.name;
    this.connections = [];
    this.locations = [];
    region.locations?.forEach(l => {
      this.locations.push({
        name: l.name,
        type: l.type,
        rules: l.rule,
      })
    })
  }
}

/**
 * Traverses through the logic and connects all rooms by their individual regions together in a contained graph.
 */
export class LogicGraph {
  private root: RegionNode;
  private checkpointNodes: Array<RegionNode> = [];

  constructor(level: RawLogicLevel) {
    let mainRoom: RawLogicRoom | undefined;
    // Get the spawn point which should always be where the checkpoint name is Start
    for (let i = 0; i < level.rooms.length; i++) {
      const room = level.rooms[i];
      if (room?.checkpoint === `Start`) {
        mainRoom = room;
        break;
      }
    }
    if (!mainRoom) throw new Error(`Failed to spawn from level ${level.name}`);
    const startRegion = mainRoom.regions.find(r => r.name === mainRoom?.checkpoint_region)
    if (!startRegion) throw new Error(`Failed to find region from starting room in level: ${level.name};${mainRoom.name}`)
    this.root = new RegionNode(mainRoom.name, startRegion, mainRoom.checkpoint);
    this.fillChildren(level, this.root, mainRoom, startRegion);
  }

  private fillChildren(
    level: RawLogicLevel,
    node: RegionNode,
    currentRoom: RawLogicRoom,
    currentRegion: RawLogicRegion,
    currentNodes: Record<string, Record<string, RegionNode>> = {}
  ) {
    const roomNodes = currentNodes[currentRoom.name];
    if (roomNodes) {
      if (roomNodes[node.name]) return;
      roomNodes[node.name] = node;
    } else {
      currentNodes[currentRoom.name] = {[node.name]: node};
    }
    const getChildNode = (roomId: string, regionName: string) => {
      const roomNodes = currentNodes[roomId];
      if (!roomNodes) return null;
      return roomNodes[regionName];
    }
    // add any nodes that are at a checkpoint except for the main spawn location
    if (node.checkpoint && node.checkpoint !== `Start`) {
      this.checkpointNodes.push(node);
    }
    // get connecting regions from the current region
    for (let i = 0; i < currentRegion.connections.length; i++) {
      const childRegionConn = currentRegion.connections[i];
      if (!childRegionConn) continue;
      const childRegion = currentRoom.regions.find(r => r.name === childRegionConn?.dest);
      if (!childRegion) continue;
      let childNode = getChildNode(currentRoom.name, childRegion.name);
      if (!childNode) {
        childNode = new RegionNode(currentRoom.name, childRegion, currentRoom.checkpoint_region === childRegion.name ? currentRoom.checkpoint : undefined);
      }
      node.connections.push({
        rules: childRegionConn.rule,
        child: childNode,
      });
      this.fillChildren(level, childNode, currentRoom, childRegion, currentNodes);
    }
    // get potential room this region connects to
    const door = currentRoom.doors.find(d => d.name === currentRegion.name);
    // Can't access the room pass this door if it closes behind
    if (door && !door.closes_behind) {
      let newRoomInfo = {
        roomId: ``,
        regionName: ``,
      }
      // find which room this door leads to and depending on the matching keys then the opposite key will be the new room
      const roomConn = level.room_connections.find(r => {
        if (r.source_room === currentRoom.name && r.source_door === door.name) {
          newRoomInfo = {
            roomId: r.dest_room,
            regionName: r.dest_door,
          }
          return true;
        } else if (r.dest_room === currentRoom.name && r.dest_door === door.name) {
          newRoomInfo = {
            roomId: r.source_room,
            regionName: r.source_door,
          }
          return true;
        }
      });
      if (!roomConn) return;
      const toRoom = level.rooms.find(r => r.name === newRoomInfo.roomId);
      if (!toRoom) return;
      const toRegion = toRoom.regions.find(r => r.name === newRoomInfo.regionName);
      if (!toRegion) return;
      let childNode = getChildNode(toRoom.name, toRegion.name);
      if (!childNode) {
        childNode = new RegionNode(toRoom.name, toRegion, toRoom.checkpoint_region === toRegion.name ? toRoom.checkpoint : undefined);
      }
      node.connections.push({
        rules: [],
        child: childNode,
      });
      this.fillChildren(level, childNode, toRoom, toRegion, currentNodes);
    }
  }

  getRoot() {return this.root}

  getCheckpointNodes() {return this.checkpointNodes}
}
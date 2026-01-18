import {RawLogicLevel, RawLogicRoom, Rules} from "./logicHandling";

interface NodeChild {
  rules: Rules;
  child: RoomNode;
}

// class RegionNode {
//   name: string;
//   connections: Array<RegionNode>;
//   roomConnection: RoomNode;
// }

class RoomNode {
  id: string;
  children: Array<NodeChild>;

  constructor(room: RawLogicRoom) {
    this.id = room.name;
    this.children = [];
  }
}

export class LogicGraph {
  private root: RoomNode;

  constructor(level: RawLogicLevel) {
    let mainRoom;
    for (let i = 0; i < level.rooms.length; i++) {
      const room = level.rooms[i];
      if (room?.checkpoint === `Start`) {
        mainRoom = room;
        break;
      }
    }
    if (!mainRoom) throw new Error(`Failed to spawn from level ${level.name}`);
    this.root = new RoomNode(mainRoom);
    this.fillChildren(level, this.root, mainRoom);
  }

  private fillChildren(level: RawLogicLevel, node: RoomNode, room: RawLogicRoom, currentNodes: Record<string, RoomNode> = {}) {
    if (currentNodes[room.name]) return;
    currentNodes[room.name] = node;
    for (let i = 0; i < room.doors.length; i++) {
      const door = room.doors[i];
      // can't to this room if the door closes behind
      if (!door || door.closes_behind) continue;
      const toRegion = room.regions.find(region => region.name === door.name);
      if (!toRegion) continue;
      const roomConn = level.room_connections
        .find(r => r.source_room === room.name && r.source_door === door.name || r.dest_room === room.name && r.dest_door === door.name);
      if (!roomConn) continue;
      const rules: Rules = [];
      // add the rules of all the regions that can go to the region connecting to the door
      toRegion.connections.forEach(fromRegionConn => {
        const fromRegion = room.regions.find(region => region.name === fromRegionConn.dest);
        if (!fromRegion) return;
        const toRegionConn = fromRegion.connections.find(region => region.dest === toRegion.name);
        if (toRegionConn && toRegionConn.rule.length > 0) {
          rules.push(...toRegionConn.rule);
        }
      });
      let searchSource = true;
      if (roomConn.source_room === room.name) searchSource = false;
      const toRoom = level.rooms.find(r => {
        if (searchSource) {
          return roomConn.source_room === r.name;
        }
        return roomConn.dest_room === r.name;
      });
      if (toRoom) {
        const childNode = currentNodes[toRoom.name] ?? new RoomNode(toRoom);
        node.children.push({
          rules,
          child: childNode,
        });
        this.fillChildren(level, childNode, toRoom, currentNodes);
      }
    }
  }

  getRoot() {return this.root}
}
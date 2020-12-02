//#region Require('./)
import _ from "lodash";
import {
  BASE_PLANNER_TIMER,
  MemoryApi_All,
  MemoryApi_Empire,
  MemoryApi_Room,
  MemoryHelper_Room,
  OldRoomPlanner,
  RoomHelper_State,
  RoomHelper_Structure,
  ROOM_PLANNER_TIMER,
  RUN_LINKS_TIMER,
  UPDATE_LINKS_TIMER,
  UPDATE_MINERAL_AMOUNT_TIMER,
  UPDATE_SOURCE_STRUCTURES_TIMER
} from "Utils/importer/internals";
//#endregion

//#region Class
export class RoomManager {
  /**
   * Get all ownedRooms and run the runSingleRoom function on the rooms
   * @returns {void} Only calls other class member functions
   */
  public static runRoomManager(): void {
    // Get all ownedRooms and run for each room found the runSingleRoom function
    const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
    _.forEach(ownedRooms, (room: Room) => this.runSingleRoom(room));

    // Run all dependent rooms we have visiblity in
    const dependentRooms: Room[] = MemoryApi_Room.getVisibleDependentRooms();
    _.forEach(dependentRooms, (room: Room) => {
      this.runSingleDependentRoom(room);
    });
  }

  private static runSingleRoom(room: Room): void {
    const cpuStart: number = MemoryApi_All.preCpuGetter();
    const roomState: string = RoomHelper_State.getRoomState(room);

    if (room.controller!.level >= 3) {
      if (roomState === "ATTACK") {
        RoomHelper_Structure.towerAttacking(room);
      } else {
        RoomHelper_Structure.towerRepairing(room);
        RoomHelper_Structure.towerHealing(room);
      }
    }

    if (MemoryApi_All.executeEachTicks(ROOM_PLANNER_TIMER)) {
      OldRoomPlanner.roomPlanner(room);
    }
    if (MemoryApi_All.executeEachTicks(BASE_PLANNER_TIMER)) {
      OldRoomPlanner.basePlanner(room);
    }

    if (MemoryApi_All.executeEachTicks(UPDATE_SOURCE_STRUCTURES_TIMER)) {
      MemoryHelper_Room.updateSourceStructures(room);
    }
    if (MemoryApi_All.executeEachTicks(UPDATE_MINERAL_AMOUNT_TIMER)) {
      MemoryHelper_Room.updateMineralAmount(room);
    }

    if (room.controller!.level >= 5) {
      if (MemoryApi_All.executeEachTicks(UPDATE_LINKS_TIMER)) {
        MemoryHelper_Room.updateAllLinksInMemory(room);
      }

      if (MemoryApi_All.executeEachTicks(RUN_LINKS_TIMER)) {
        RoomHelper_Structure.runLinks(room);
      }
    }

    const cpuEnd: number = MemoryApi_All.endCpuGetter();
    Memory.stats.rooms[room.name].cpu.used = cpuEnd - cpuStart;
  }

  private static runSingleDependentRoom(room: Room): void {
    const roomType: string = MemoryApi_Room.getRoomType(room);

    if (roomType !== 'score') {
      if (MemoryApi_All.executeEachTicks(ROOM_PLANNER_TIMER)) {
        OldRoomPlanner.roomPlanner(room);
      }
      
      if (MemoryApi_All.executeEachTicks(UPDATE_SOURCE_STRUCTURES_TIMER)) {
        MemoryHelper_Room.updateSourceStructures(room);
      }
    }
    else if (roomType === "score") { 
      const spawnRoom: Room | null = MemoryApi_Room.getSpawnRoomOfDependentRoom(room);

      if (spawnRoom !== null) {
        MemoryApi_Room.checkIfScoreContainerRoomIsFinished(room, spawnRoom);
      }
    }
  }
}
//#endregion

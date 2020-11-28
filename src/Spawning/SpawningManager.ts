//#region Require('./)
import _ from "lodash";
import {
  Config,
  MemoryApi_Empire,
  SpawningApi,
  SpawningHelper,
  MemoryApi_All,
  SPAWN_CREEP_TIMER
} from "Utils/importer/internals";
//#endregion

//#region Class
export class SpawningManager {
  /**
   * Get all ownedRooms and run the runSpawningForRoom function on the rooms
   * @returns {void} Only calls other class member functions
   */
  public static runSpawningManager(): void {
    // Get all ownedRooms and run for each room found the runSpawningForRoom function
    const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
    _.forEach(ownedRooms, (room: Room) => {
      // Run SpawnCreep if the ExecuteEachTicks returns true;
      if (MemoryApi_All.executeEachTicks(SPAWN_CREEP_TIMER)) {
        MemoryApi_All.functionRunnerWithCpu(
          SpawningManager.runSpawningForRoom,
          MemoryApi_All.isMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
          "spawnCreep",
          "=",
          room
        );
      } else if (MemoryApi_All.isMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined) {
        MemoryApi_All.memoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["spawnCreep"], 0);
      }
    });
  }

  /**
   * Run spawning logic in a room
   * @param room Room to run spawning in
   */
  private static runSpawningForRoom(room: Room): void {
    SpawningHelper.spawnNormalCreep(room);

    const remoteRoomsArray = Object.keys(room.memory.remoteRooms!);
    _.forEach(remoteRoomsArray, (remoteRoomObject: RoomMemory) => {
      const remoteRoom: Room = Game.rooms[remoteRoomObject.roomName!];
      SpawningHelper.spawnRemoteCreep(room, remoteRoom);
    });
  }
}
//#endregion

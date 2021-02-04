// #region Require('./)
import { Config, JobsHelper, SpawningApi } from 'Utils/Importer/internals';
import _ from 'lodash';
// #endregion

// #region Class
export class SpawningHelper {
  public static spawnNormalCreep(spawnRoom: Room): ScreepsReturnCode {
    const nextCreep = SpawningApi.getNextRoleName(spawnRoom, 'owned');
    if (!nextCreep[0]) {
      return OK;
    }

    const spawns: StructureSpawn[] = SpawningApi.getAllOpenSpawn(spawnRoom);
    const memory: CreepMemory = SpawningApi.getCreepMemory(spawnRoom, nextCreep[1]);
    if (spawns && spawns.length > 0) {
      const bodyResult = SpawningApi.getCreepParts(spawnRoom, memory.role);
      let spawnResult: ScreepsReturnCode = ERR_BUSY;
      if (nextCreep[1] != "dj") {
        spawnResult = this.spawnCreep(spawnRoom, _.first(spawns), memory, bodyResult.body);
      }
      else { 
        const spawn = SpawningApi.getDjSpawn(spawnRoom);
        if (spawn !== null) spawnResult = this.spawnCreep(spawnRoom, spawn, memory, bodyResult.body);
      }
      if (spawnResult === OK) {
        Config.expenses.spawnExpenses[spawnRoom.name][memory.role] += bodyResult.bodyCost;
        JobsHelper.updateAllSpawnerEnergyStructuresJobs(spawnRoom);
      }
      return spawnResult;
    }
    return ERR_BUSY;
  }

  public static spawnRemoteCreep(spawnRoom: Room, targetRoom: Room, targetRoomName: string): ScreepsReturnCode {
    if (spawnRoom.energyAvailable * 2 <= spawnRoom.energyCapacityAvailable) return ERR_BUSY;

    const nextCreep = SpawningApi.getNextRoleName(targetRoom, 'remote', targetRoom);
    if (!nextCreep[0]) {
      return OK;
    }

    const spawns: StructureSpawn[] = SpawningApi.getAllOpenSpawn(spawnRoom);
    const memory: CreepMemory = SpawningApi.getCreepMemory(spawnRoom, nextCreep[1], targetRoomName);
    if (spawns && spawns.length > 0) {
      const bodyResult = SpawningApi.getCreepParts(spawnRoom, memory.role);
      const spawnResult = this.spawnCreep(spawnRoom, _.first(spawns), memory, bodyResult.body);
      if (spawnResult === OK && Config.expenses.spawnExpenses[targetRoomName]) {
        Config.expenses.spawnExpenses[targetRoomName][memory.role] += bodyResult.bodyCost;
        JobsHelper.updateAllSpawnerEnergyStructuresJobs(spawnRoom);
      }
      return spawnResult;
    }
    return ERR_BUSY;
  }

  private static spawnCreep(
    spawnRoom: Room,
    spawn: StructureSpawn,
    memory: CreepMemory,
    body: BodyPartConstant[]
  ): ScreepsReturnCode {
    return spawn.spawnCreep(body, SpawningApi.getCreepName(memory.role), {
      memory,
      directions: SpawningApi.getCreepDirections(memory.role, spawnRoom)
    });
  }
}
// #endregion

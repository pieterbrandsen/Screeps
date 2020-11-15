//#region Require('./)
import {
  Config,
  TimerRunner,
  FunctionRunnerWithCpu,
  GetAllEnergyStructures,
  GetConstructionSites,
  GetDamagedStructures,
  GetDamagedCreeps,
  GetHostileCreeps,
  GlobalRoomStructureNullChecker,
  RunSpawnCreep,
  GetSpawnEnergyStructures,
  OwnedRoomStructureNullChecker,
  LinksHandler,
  RoomPlanner,
  BasePlanner,
  IsMemoryPathDefined,
  MemoryAverager
} from "../Utils/importer";
//#endregion

//#region Functions()
const globalTimers = () => {};

const globalRoomTimers = (room: Room) => {
  // Create a acces point to the flagMemory //
  const flagMemory: FlagMemory = Memory.flags[room.name];

  // Run RoomPlanner if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.roomPlanner.room) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      RoomPlanner,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "roomPlanner","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
  MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["roomPlanner"], 0);

  // Run GetAllEnergyStructures if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.getAllEnergyStructures) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      GetAllEnergyStructures,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "getAllEnergyStructures","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined) MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["getAllEnergyStructures"], 0);

  // Run GetConstructionSites if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.getConstructionSites) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      GetConstructionSites,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "getConstructionSites","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
  MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["getConstructionSites"], 0);

  // Run GetDamagedStructures if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.getDamagedStructures) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      GetDamagedStructures,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "getDamagedStructures","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
    Memory.stats.rooms[room.name].cpu.smallModules["getDamagedStructures"] = 0;

  // Run GetDamagedCreeps if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.getDamagedCreeps) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      GetDamagedCreeps,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "getDamagedCreeps","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
  MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["getDamagedCreeps"], 0);

  // Run GetHostileCreeps if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.getHostileCreeps) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      GetHostileCreeps,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "getHostileCreeps","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
    Memory.stats.rooms[room.name].cpu.smallModules["getHostileCreeps"] = 0;

  // Run GlobalRoomStructureNullChecker if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.structureNullChecker) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      GlobalRoomStructureNullChecker,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "globalRoomStructureNullChecker","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
    MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["globalRoomStructureNullChecker"], 0);
};

const ownedRoomTimers = (room: Room) => {
  // Run all the timers from the globalRoom part
  globalRoomTimers(room);

  // Create a acces point to the flagMemory //
  const flagMemory: FlagMemory = Memory.flags[room.name];

  // Run BasePlanner if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.roomPlanner.base) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      BasePlanner,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "basePlanner","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
  MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["basePlanner"], 0);

  // Run SpawnCreep if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.spawnCreep) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      RunSpawnCreep,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "spawnCreep","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
  MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["spawnCreep"], 0);

  // Run GetSpawnEnergyStructures if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.getSpawnEnergyStructures) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      GetSpawnEnergyStructures,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "getSpawnEnergyStructures","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
  MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["getSpawnEnergyStructures"], 0);

  // Run OwnedRoomStructureNullChecker if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.structureNullChecker) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      OwnedRoomStructureNullChecker,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "ownedRoomStructureNullChecker","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
  MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["ownedRoomStructureNullChecker"], 0);

  // Run GetSpawnEnergyStructures if the TimerRunner returns true;
  if (TimerRunner(Config.rooms.loops.linkHandler) || !flagMemory.isFilled)
    FunctionRunnerWithCpu(
      LinksHandler,
      IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`),
      "linkHandler","=",
      room
    );
  else if (IsMemoryPathDefined(`Memory.stats.rooms.${room.name}.cpu.smallModules`) !== undefined)
  MemoryAverager(Memory.stats.rooms[room.name].cpu.smallModules["linkHandler"], 0);
};

const remoteRoomTimers = (room: Room) => {
  // Run all the timers from the globalRoom part
  globalRoomTimers(room);

  // Create a acces point to the flagMemory //
  // const flagMemory: FlagMemory = Memory.flags[room.name];
};
//#endregion

//#region Export functions
export {
  globalTimers as GlobalTimers,
  globalRoomTimers as GlobalRoomTimers,
  ownedRoomTimers as OwnedRoomTimers,
  remoteRoomTimers as RemoteRoomTimers
};
//#endregion
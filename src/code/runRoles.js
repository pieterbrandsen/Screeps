// #region Require
require('./config');
// #endregion

// #region Functions
const isInTargetRoom = (creep, currentRoom, targetRoom) => {
  // Check if current room is target room, return true if not false
  if (currentRoom === targetRoom) return true;
  else return moveToRoom(creep, targetRoom);
};

const getMissingPartsCount = (creep) => {
  if (!creep.memory.parts) {
    creep.memory.parts = {
      work: creep.getActiveBodyparts(WORK),
      carry: creep.getActiveBodyparts(CARRY),
    };
  }
};

const moveToRoom = (creep, targetRoom) => {
  // Define the way how the creep is going to this room
  let travelWay = 'unknown';
  const targetRoomFlag = Game.flags[targetRoom];

  if (targetRoomFlag) travelWay = 'flag';
  switch (travelWay) {
  case 'flag':
    creep.travelTo(targetRoomFlag);
    break;
  default:
    creep.travelTo(new RoomPosition(25, 25, targetRoom));
    break;
  }

  // Return true if creep is in targetRoom after moving
  if (creep.room.name === targetRoom) {
    return true;
  }
};
// #endregion

const pioneer = (creep) => {
  // Acces flagMemory
  const flagMemory = Memory.flags[creep.memory.spawnRoom];

  // Check if creep needs to move to another room
  if (!isInTargetRoom(creep, creep.room.name, creep.memory.targetRoom)) return;

  // Get creep module
  let creepModule;
  try {
    // eslint-disable-next-line global-require
    creepModule = require(`./creepModule.${creep.memory.job}`);
  } catch (error) {
    creep.memory.job = 'withdraw';
    return;
  }

  // Set cpuUsed to zero
  let cpuUsedStart = Game.cpu.getUsed();
  const result = creepModule.execute(creep);
  if (Memory.stats[Game.shard.name].rooms[creep.room.name] !== undefined) {
    const cpuUsedEnd = Game.cpu.getUsed();
    config.creepModuleCpuCost[creep.room.name][creep.memory.job] +=
    cpuUsedEnd - cpuUsedStart;
    cpuUsedStart = cpuUsedEnd;
  }
  switch (result) {
  case 'full':
    // Delete targetId and miniJob
    delete creep.memory.targetId;
    delete creep.memory.miniJob;
    delete creep.memory.sourceId;
    delete creep.memory.sourceNumber;

    // Switch to one of the jobs that drains energy
    if (flagMemory.commonMemory.spawnEnergyStructures.length > 0) {
      creep.memory.job = 'transfer';
    } else if (
      flagMemory.commonMemory.energyStored.capacity > 10000 &&
        flagMemory.commonMemory.energyStored.capacity / 10 >
          flagMemory.commonMemory.energyStored.usable
    ) {
      creep.memory.job = 'transfer';
    } else if (
      flagMemory.commonMemory.controllerStorage.usable < 1500 &&
        flagMemory.commonMemory.controllerStorage.type ===
          STRUCTURE_CONTAINER
    ) {
      creep.memory.job = 'transfer';
    } else if (flagMemory.repair.targets.length > 0) {
      creep.memory.job = 'repair';
    } else if (flagMemory.commonMemory.constructionSites.length > 0) {
      creep.memory.job = 'build';
    } else {
      creep.memory.job = 'upgrade';
    }
    break;
  case 'empty':
    // Delete targetId and sourceId
    delete creep.memory.targetId;
    delete creep.memory.sourceId;
    delete creep.memory.sourceNumber;
    delete creep.memory.miniJob;

    // Switch to one of the roles that gets energy
    if (flagMemory.commonMemory.energyStored.usable > 1500) {
      creep.memory.job = 'withdraw';
    } else {
      creep.memory.job = 'harvest';
    }
    break;
  default:
    break;
  }
};

const harvester = (creep, roleName) => {
  // Check if creep needs to move to another room
  if (!isInTargetRoom(creep, creep.room.name, creep.memory.targetRoom)) return;

  // Get creep module
  let creepModule;
  try {
    // eslint-disable-next-line global-require
    creepModule = require(`./creepModule.${creep.memory.job}`);
  } catch (error) {
    creep.memory.job = 'harvest';
    return;
  }

  // Set cpuUsed to zero
  let cpuUsedStart = Game.cpu.getUsed();
  const result = creepModule.execute(creep);
  if (Memory.stats[Game.shard.name].rooms[creep.room.name] !== undefined) {
    const cpuUsedEnd = Game.cpu.getUsed();
    config.creepModuleCpuCost[creep.room.name][creep.memory.job] +=
    cpuUsedEnd - cpuUsedStart;
    cpuUsedStart = cpuUsedEnd;
  }
  switch (result) {
  case 'full':
    // Delete targetId
    delete creep.memory.targetId;
    creep.memory.miniJob = 'harvest';

    // Switch to one of the jobs that drains energy
    creep.memory.job = 'transfer';
    break;
  case 'empty':
    // Delete targetId
    delete creep.memory.targetId;

    // Switch to one of the roles that gets energy
    creep.memory.job = 'harvest';
    break;
  default:
    break;
  }
};

const transferer = (creep, roleName) => {
  // Get creep module
  let creepModule;
  try {
    // eslint-disable-next-line global-require
    creepModule = require(`./creepModule.${creep.memory.job}`);
  } catch (error) {
    creep.memory.job = 'withdraw';
    return;
  }

  // Set cpuUsed to zero
  let cpuUsedStart = Game.cpu.getUsed();
  const result = creepModule.execute(creep);
  if (Memory.stats[Game.shard.name].rooms[creep.room.name] !== undefined) {
    const cpuUsedEnd = Game.cpu.getUsed();
    config.creepModuleCpuCost[creep.room.name][creep.memory.job] +=
    cpuUsedEnd - cpuUsedStart;
    cpuUsedStart = cpuUsedEnd;
  }

  switch (result) {
  case 'full':
    // Delete targetId
    delete creep.memory.targetId;
    delete creep.memory.miniJob;

    // Check if creep needs to move to another room
    if (!isInTargetRoom(creep, creep.room.name, creep.memory.spawnRoom)) {
      return;
    }

    // Switch to one of the jobs that drains energy
    creep.memory.job = 'transfer';
    break;
  case 'empty':
    // Delete targetId
    delete creep.memory.targetId;
    delete creep.memory.miniJob;

    // Check if creep needs to move to another room
    if (!isInTargetRoom(creep, creep.room.name, creep.memory.targetRoom)) {
      return;
    }

    // Switch to one of the roles that gets energy
    creep.memory.job = 'withdraw';
    break;
  default:
    break;
  }
};

const upgrader = (creep, roleName) => {
  // Check if creep needs to move to another room
  if (!isInTargetRoom(creep, creep.room.name, creep.memory.targetRoom)) return;

  // Acces flagMemory
  const flagMemory = Memory.flags[creep.memory.spawnRoom];

  // Get creep module
  let creepModule;
  try {
    // eslint-disable-next-line global-require
    creepModule = require(`./creepModule.${creep.memory.job}`);
  } catch (error) {
    creep.memory.job = 'withdraw';
    return;
  }

  // Set cpuUsed to zero
  let cpuUsedStart = Game.cpu.getUsed();
  const result = creepModule.execute(creep);
  if (Memory.stats[Game.shard.name].rooms[creep.room.name] !== undefined) {
    const cpuUsedEnd = Game.cpu.getUsed();
    config.creepModuleCpuCost[creep.room.name][creep.memory.job] +=
    cpuUsedEnd - cpuUsedStart;
    cpuUsedStart = cpuUsedEnd;
  }

  switch (result) {
  case 'full':
    // Delete targetId
    delete creep.memory.targetId;

    // Switch to one of the jobs that drains energy
    creep.memory.job = 'upgrade';
    break;
  case 'empty':
    // Delete targetId
    delete creep.memory.targetId;

    // Switch to one of the roles that gets energy
    if (
      flagMemory.commonMemory.energyStored.usable >= 10 * 1000 ||
        (flagMemory.commonMemory.controllerStorage.usable >= 250 && Game.getObjectById(flagMemory.commonMemory.controllerStorage.id) !== null)
    ) {
      creep.memory.job = 'withdraw';
    } else {
      creep.memory.job = 'harvest';
    }
    break;
  default:
    break;
  }
};

const repairer = (creep, roleName) => {
  // Check if creep needs to move to another room
  if (!isInTargetRoom(creep, creep.room.name, creep.memory.targetRoom)) return;

  // Acces flagMemory
  const flagMemory = Memory.flags[creep.memory.spawnRoom];

  // Get creep module
  let creepModule;
  try {
    // eslint-disable-next-line global-require
    creepModule = require(`./creepModule.${creep.memory.job}`);
  } catch (error) {
    creep.memory.job = 'withdraw';
    return;
  }

  // Set cpuUsed to zero
  let cpuUsedStart = Game.cpu.getUsed();
  const result = creepModule.execute(creep);
  if (Memory.stats[Game.shard.name].rooms[creep.room.name] !== undefined) {
    const cpuUsedEnd = Game.cpu.getUsed();
    config.creepModuleCpuCost[creep.room.name][creep.memory.job] +=
    cpuUsedEnd - cpuUsedStart;
    cpuUsedStart = cpuUsedEnd;
  }
  switch (result) {
  case 'full':
    // Delete targetId
    delete creep.memory.targetId;
    delete creep.memory.miniJob;

    // Switch to one of the jobs that drains energy
    if (flagMemory.repair.targets.length > 0) creep.memory.job = 'repair';
    else creep.memory.job = 'upgrade';
    break;
  case 'empty':
    // Delete targetId
    delete creep.memory.targetId;
    delete creep.memory.miniJob;

    // Switch to one of the roles that gets energy
    if (flagMemory.commonMemory.energyStored.usable >= 2000) {
      creep.memory.job = 'withdraw';
    } else {
      creep.memory.job = 'harvest';
    }
    break;
  default:
    break;
  }
};

const builder = (creep, roleName) => {
  // Check if creep needs to move to another room
  if (!isInTargetRoom(creep, creep.room.name, creep.memory.targetRoom)) return;

  // Acces flagMemory
  const flagMemory = Memory.flags[creep.memory.spawnRoom];

  // Get creep module
  let creepModule;
  try {
    // eslint-disable-next-line global-require
    creepModule = require(`./creepModule.${creep.memory.job}`);
  } catch (error) {
    creep.memory.job = 'withdraw';
    return;
  }

  // Set cpuUsed to zero
  let cpuUsedStart = Game.cpu.getUsed();
  const result = creepModule.execute(creep);
  if (Memory.stats[Game.shard.name].rooms[creep.room.name] !== undefined) {
    const cpuUsedEnd = Game.cpu.getUsed();
    config.creepModuleCpuCost[creep.room.name][creep.memory.job] +=
    cpuUsedEnd - cpuUsedStart;
    cpuUsedStart = cpuUsedEnd;
  }
  switch (result) {
  case 'full':
    // Delete targetId
    delete creep.memory.targetId;
    delete creep.memory.miniJob;

    // Switch to one of the jobs that drains energy
    if (flagMemory.commonMemory.constructionSites.length > 0) creep.memory.job = 'build';
    else creep.memory.job = 'upgrade';
    break;
  case 'empty':
    // Delete targetId
    delete creep.memory.targetId;
    delete creep.memory.miniJob;

    // Switch to one of the roles that gets energy
    if (flagMemory.commonMemory.energyStored.usable >= 2000) {
      creep.memory.job = 'withdraw';
    } else {
      creep.memory.job = 'harvest';
    }
    break;
  default:
    break;
  }
};

const reserver = (creep, roleName) => {
  // Check if creep needs to move to another room
  if (!isInTargetRoom(creep, creep.room.name, creep.memory.targetRoom)) return;

  // Get creep module
  let creepModule;
  try {
    // eslint-disable-next-line global-require
    creepModule = require(`./creepModule.${creep.memory.job}`);
  } catch (error) {
    creep.memory.job = 'reserve';
    return;
  }

  // Set cpuUsed to zero
  let cpuUsedStart = Game.cpu.getUsed();
  creepModule.execute(creep);
  if (Memory.stats[Game.shard.name].rooms[creep.room.name] !== undefined) {
    const cpuUsedEnd = Game.cpu.getUsed();
    config.creepModuleCpuCost[creep.room.name][creep.memory.job] +=
    cpuUsedEnd - cpuUsedStart;
    cpuUsedStart = cpuUsedEnd;
  }
};

const claimer = (creep, roleName) => {
  // Check if creep needs to move to another room
  if (!isInTargetRoom(creep, creep.room.name, creep.memory.targetRoom)) return;

  // Get creep module
  let creepModule;
  try {
    // eslint-disable-next-line global-require
    creepModule = require(`./creepModule.${creep.memory.job}`);
  } catch (error) {
    creep.memory.job = 'claim';
    return;
  }

  // Set cpuUsed to zero
  let cpuUsedStart = Game.cpu.getUsed();
  creepModule.execute(creep);
  if (Memory.stats[Game.shard.name].rooms[creep.room.name] !== undefined) {
    const cpuUsedEnd = Game.cpu.getUsed();
    config.creepModuleCpuCost[creep.room.name][creep.memory.job] +=
    cpuUsedEnd - cpuUsedStart;
    cpuUsedStart = cpuUsedEnd;
  }
};

module.exports = {
  // Run the harvester's //
  pioneer: (creep, shortRoleName) => {
    getMissingPartsCount(creep);
    pioneer(creep, shortRoleName);
  },

  // Run the harvester's //
  harvester: (creep, shortRoleName) => {
    getMissingPartsCount(creep);
    harvester(creep, shortRoleName);
  },

  // Run the transferer's //
  transferer: (creep, shortRoleName) => {
    getMissingPartsCount(creep);
    transferer(creep, shortRoleName);
  },

  // Run the upgrader's //
  upgrader: (creep, shortRoleName) => {
    getMissingPartsCount(creep);
    upgrader(creep, shortRoleName);
  },

  // Run the repairer's //
  repairer: (creep, shortRoleName) => {
    getMissingPartsCount(creep);
    repairer(creep, shortRoleName);
  },

  // Run the builder's //
  builder: (creep, shortRoleName) => {
    getMissingPartsCount(creep);
    builder(creep, shortRoleName);
  },

  // Run the resever's //
  reserver: (creep, shortRoleName) => {
    getMissingPartsCount(creep);
    reserver(creep, shortRoleName);
  },

  // Run the claimer's //
  claimer: (creep, shortRoleName) => {
    getMissingPartsCount(creep);
    claimer(creep, shortRoleName);
  },
};
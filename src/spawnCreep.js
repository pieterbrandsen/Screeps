// #region Require
require('./config');
// #endregion


// #region
const spawnCreep = (room, roomType, data, roleCount) => {
  // Get flagMemory from spawnRoom
  const flagMemory = Memory.flags[room.name];

  // Get all spawns //
  const headSpawn = Game.getObjectById(flagMemory.commonMemory.headSpawnId);
  let spawn = room.spawns.find((spawn) => spawn.spawning === null);
  if (spawn === undefined || headSpawn === null) return;

  let rolesNeededInRoom = [];
  switch (roomType) {
  case 'owned':
    rolesNeededInRoom = [
      'pioneer',
      'transferer',
      'harvester-0',
      'harvester-1',
      'builder',
      'repairer',
      'upgrader',
      'claimerLD',
      'builderLD',
      'end',
    ];
    break;
  case 'remote':
    rolesNeededInRoom = [
      'transfererLD',
      'reserverLD',
      'repairerLD',
      'harvesterLD-0',
      'harvesterLD-1',
      'end',
    ];
    break;
  case 'external':
    // TODO For automatic claims, search a room manually and place a claim flag
    break;
  default:
    break;
  }

  const initCreepMemory = (room, role, data) => {
    const newMemory = {};
    for (const key in data) {
      if (data[key]) {
        const element = data[key];
        newMemory[element] = data[element];
      }
    }

    // Init all undefined memory variables
    if (!newMemory.targetRoom) newMemory.targetRoom = room.name;
    if (!newMemory.spawnRoom) newMemory.spawnRoom = room.name;
    if (!newMemory.role) newMemory.role = role;
    if (!newMemory.job) newMemory.job = undefined;
    if (!newMemory.targetId) newMemory.targetId = undefined;

    const flagMemory = Memory.flags[newMemory.targetRoom];
    if (role.includes('harvester') && !newMemory.sourceId) {
      if (
        typeof flagMemory.commonMemory.sources[role.split('-')[1]] === 'object'
      ) {
        newMemory.sourceId =
          flagMemory.commonMemory.sources[role.split('-')[1]].id;
      }
    }

    if (room.controller.level >= 6 && room.terminal) {
      if (role === 'transfererLiTe') newMemory.directions = [TOP_RIGHT];
      else {
        newMemory.directions = [
          TOP,
          RIGHT,
          BOTTOM_RIGHT,
          BOTTOM,
          BOTTOM_LEFT,
          LEFT,
          TOP_LEFT,
        ];
      }
    } else {
      newMemory.directions = [
        TOP,
        TOP_RIGHT,
        RIGHT,
        BOTTOM_RIGHT,
        BOTTOM,
        BOTTOM_LEFT,
        LEFT,
        TOP_LEFT,
      ];
    }

    return newMemory;
  };

  const checkIfRoleCanBeSpawned = (role, room, memory) => {
    const shortRoleName = role.split('-')[0].replace('LD', '');
    const targetRoom = Game.rooms[memory.targetRoom];
    const targetFlagMemory = Memory.flags[memory.targetRoom];
    let result = false;

    switch (role) {
    // Owned room roles
    case 'pioneer':
      // Check if input role is less then max creeps allowed //
      if (roleCount[role] >= config.creepsCountMax[shortRoleName] * flagMemory.commonMemory.sources.length) break;

      // If energy capacity is more then 1200
      if (room.energyCapacityAvailable > 300 || room.energyAvailable > 300) {
        break;
      }

      if (room.energyAvailable === 300) {
        result = true;
      }
      break;
    case 'transferer':
    case 'transfererLD':
      // Check if input role is less then max creeps allowed //
      if (roleCount[role] >= config.creepsCountMax[shortRoleName]) break;

      // If energy capacity is less then 300
      if (room.energyCapacityAvailable <= 300) break;

      if (targetRoom === undefined) break;

      if (
        targetFlagMemory === undefined ||
          targetFlagMemory.commonMemory.energyStorages.usable < 1000
      ) {
        break;
      }

      result = true;
      break;
    case 'upgrader':
      if (room.controller.ticksToDowngrade <= 1 * 1000) {
        // Check if input role is less then max creeps allowed //
        if (roleCount[role] >= 1) break;
        else result = true;
      } else {
        // Check if input role is less then max creeps allowed //
        if (roleCount[role] >= config.creepsCountMax[shortRoleName]) break;
      }

      if (targetRoom === undefined) break;

      if (
        targetFlagMemory === undefined &&
          targetFlagMemory.commonMemory.energyStorages.usable < targetFlagMemory.commonMemory.energyStorages.capacity / 20
      ) {
        break;
      }

      result = true;
      break;
    case 'builder':
    case 'builderLD':
      // Check if input role is less then max creeps allowed //
      if (roleCount[role] >= config.creepsCountMax[shortRoleName]) break;

      // If energy capacity is less then 300
      if (room.energyCapacityAvailable <= 300) break;

      if (targetRoom === undefined) break;

      if (role.includes('LD') && !Game.flags[`builderLD${room.name}`]) break;
      else if (role.includes('LD') && Memory.flags[`builderLD${room.name}`] && Memory.flags[`builderLD${room.name}`].spawnRoom === room.name) memory.targetRoom = Memory.flags[`builderLD${room.name}`].room;

      if (
        targetFlagMemory === undefined ||
          targetFlagMemory.commonMemory.energyStorages.usable < 1500
      ) {
        break;
      }

      if (targetFlagMemory.commonMemory.constructionSites.length === 0) break;

      result = true;
      break;
    case 'repairer':
    case 'repairerLD':
      // Check if input role is less then max creeps allowed //
      if (roleCount[role] >= config.creepsCountMax[shortRoleName]) break;

      // If energy capacity is less then 300
      if (room.energyCapacityAvailable <= 300) break;

      if (targetRoom === undefined) break;

      if (
        targetFlagMemory === undefined ||
          targetFlagMemory.commonMemory.energyStorages.usable < 1500
      ) {
        break;
      }

      // Break if there is a tower to repair from
      if (room.towers.length > 0) break;

      // Break if there are no targets left
      if (targetFlagMemory.repair.targets.length === 0) break;

      result = true;
      break;
    case 'harvester-0':
    case 'harvester-1':
    case 'harvesterLD-0':
    case 'harvesterLD-1':
      // Check if input role is less then max creeps allowed //
      if (roleCount[role] >= config.creepsCountMax[shortRoleName]) break;

      // If energy capacity is less then 300
      if (room.energyCapacityAvailable <= 300) break;

      if (targetRoom === undefined) break;

      if (targetFlagMemory === undefined) break;

      result = true;
      break;
    case 'reserverLD':
      // Check if input role is less then max creeps allowed //
      if (roleCount[role] >= config.creepsCountMax[shortRoleName]) break;

      // If energy capacity is less then 300
      if (room.energyCapacityAvailable <= 300) break;

      if (targetRoom === undefined) break;

      if (targetFlagMemory === undefined) break;

      // If reservation is defined, the username is mine and the ticksToEnd is higher then 2500 ticks
      if (typeof targetRoom.controller.reservation !== 'object' || (targetRoom.controller.reservation.username !== config.username || targetRoom.controller.reservation.ticksToEnd > 2500)) break;

      result = true;
      break;
    case 'claimerLD':
      // Check if input role is less then max creeps allowed //
      if (roleCount[role] >= config.creepsCountMax[shortRoleName]) break;

      // If flag is removed, delete the memory
      if (!Game.flags['claim']) {
        delete Memory.flags['claim'];
        break;
      }

      // If room is missing claim flagMemory, assign it
      if (!Memory.flags['claim']) {
        Memory.flags['claim'] = {spawnRoom: '', room: ''};
        break;
      } else if (Memory.flags['claim'].spawnRoom === room.name && Memory.flags['claim'].room !== undefined) {
        memory.targetRoom = Memory.flags['claim'].room;
        result = true;
      }
      break;
    default:
      break;
    }
    return result;
  };

  const getCreepParts = (role, room) => {
    const flagMemory = Memory.flags[room.name];

    // Get current body cost
    const calcBodyCost = (body) => {
      return _.reduce(body, (sum, part) => sum + BODYPART_COST[part], 0);
    };
    let body = [];
    const returnBody = (parts, bodyIteration, maxLoopCount = 50) => {
      body = parts;
      let i = 0;

      while (
        calcBodyCost(body) + calcBodyCost(bodyIteration) <=
          room.energyAvailable &&
        body.length + bodyIteration.length <= MAX_CREEP_SIZE &&
        i < maxLoopCount
      ) {
        body = body.concat(bodyIteration);
        i++;
      }

      // Reset if input body is not filled with the needed parts
      if (body.length === parts.length) body = [];
    };

    switch (role) {
    case 'pioneer':
      returnBody([CARRY, MOVE, WORK], [CARRY, MOVE]);
      break;
    case 'transferer':
    case 'transfererLD':
      returnBody([CARRY, CARRY, MOVE], [CARRY, CARRY, MOVE]);
      break;
    case 'harvester-0':
    case 'harvester-1':
      if (
        typeof flagMemory.commonMemory.sources[role.split('-')[1]] ===
          'object'
      ) {
        const sourceStructureType =
            flagMemory.roomPlanner.room.sources[role.split('-')[1]]
              .structureType;
        switch (sourceStructureType) {
        case 'container':
          returnBody([MOVE], [WORK], 7);
          break;
        case 'link':
          returnBody([MOVE, CARRY], [WORK], 7);
          break;
        default:
          break;
        }
      }
      break;
    case 'harvesterLD-0':
    case 'harvesterLD-1':
      returnBody([], [WORK, MOVE], 7);
      break;
    case 'builder':
    case 'builderLD':
    case 'repairer':
    case 'repairerLD':
      returnBody([], [WORK, MOVE, CARRY]);
      break;
    case 'upgrader':
      returnBody([CARRY, MOVE, CARRY, MOVE], [WORK]);
      break;
    case 'reserverLD':
    case 'claimerLD':
      returnBody([], [CLAIM, MOVE]);
      break;
    default:
      break;
    }

    // Return body
    return body;
  };

  const aCreepHasBeenSpawned = [false, 'none'];
  rolesNeededInRoom.forEach((role) => {
    aCreepHasBeenSpawned[1] = role;

    // If a creep is already spawned
    if (aCreepHasBeenSpawned[0]) return;

    const memory = initCreepMemory(room, role, data);
    // If role can't be spawned, return
    if (!checkIfRoleCanBeSpawned(role, room, memory)) return;

    // Get creep memory and name
    const name = `${role}-${Math.round(Math.random() * 1000)}`;
    const body = getCreepParts(role, room, memory);
    const directions = memory.directions;
    delete memory.directions;

    // Check if body is filled
    if (body.length === 0) aCreepHasBeenSpawned[0] = true;

    if (role === 'transfererLiTe') spawn = headSpawn;

    // Get return value on spawnCreep
    const spawnCreep = spawn.spawnCreep(body, name, {
      memory: memory,
      directions: directions,
    });

    if (spawnCreep === OK) aCreepHasBeenSpawned[0] = true;
  });

  return aCreepHasBeenSpawned[1];
};

module.exports = {
  // Run creep spawner //
  execute: (room, roomType, data, roleCount) => {
    spawnCreep(room, roomType, data, roleCount);
  },
};

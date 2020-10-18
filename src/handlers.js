// #region require
const roomPlanner = require('./roomPlanner');

require('./config');
// #endregion


// #region functions
function getRandomFreePos(startPos, distance) {
  // Get the terrain of the Room //
  const terrain = Game.map.getRoomTerrain(startPos.roomName);
  let x;
  let y;

  // Loop until a random non-wall position is found
  do {
    x = startPos.x + Math.floor(Math.random()*(distance*2+1)) - distance;
    y = startPos.y + Math.floor(Math.random()*(distance*2+1)) - distance;
  }
  while ((x+y)%2 !== (startPos.x+startPos.y)%2 || terrain.get(x, y) === TERRAIN_MASK_WALL);
  return new RoomPosition(x, y, startPos.roomName);
}
// #endregion


// #region Handlers

// #region Global handler
const globalHandler = () => {
  if (!Memory.isFilled) memoryHandler('global');
  else {
    // Rooms handler //
    // Handles ALL global room related code
    allRoomsHandler();

    // Creep handler //
    // Handles all creeps and runs their role
    creepHandler();

    // Timers handler //
    // Handles all game timers and runs their code
    timersHandler('global');
  }
};
// #endregion


// #region All rooms handler
const allRoomsHandler = () => {
  // Return if not enough space in the bucket to run rooms //
  if (Game.cpu.bucket <= config.rooms.minBucket) return;


  // Timers through all rooms with vision in them.
  _.forEach(Object.keys(Game.rooms), (roomName) => {
    const room = Game.rooms[roomName];

    // Run room handlers //
    if (room.controller && room.controller.my) ownedRoomHandler(room);
    else if (room.controller && room.controller.reservation && room.controller.reservation.username === config.username) remoteRoomHandler(room);
  });
};
// #endregion


// #region Owned room handler
const ownedRoomHandler = (room) => {
  // Acces the flag for the room //
  const flag = Game.flags[room.name];

  // If no flag, make a new one and init the memory //
  if (!flag) {
    room.createFlag((room.controller ? room.controller.pos : getRandomFreePos({x: 0, y: 0, roomName: room.name})), room.name, COLOR_RED, COLOR_WHITE);
    Memory.flags[room.name] = {};
    memoryHandler('ownedRoom', {room: room});
  } else {
    // Run room visuals for ownedRooms  //
    roomVisualHandler(room);

    // Run all timers for ownedRooms //
    timersHandler('ownedRoom', {room: room});
  }
};
// #endregion


// #region Remote room handler
const remoteRoomHandler = (room) => {
  // Return if not enough space in the bucket to run remotes //
  if (Game.cpu.bucket <= config.rooms.remote.minBucket) return;

  // Acces the flag for the room //
  const flag = Game.flags[room.name];

  // If no flag, make a new one and init the memory //
  if (!flag) {
    room.createFlag((room.controller ? room.controller.pos : getRandomFreePos({x: 0, y: 0, roomName: room.name})), room.name, COLOR_RED, COLOR_WHITE);
    Memory.flags[room.name] = {};
    memoryHandler('remoteRoom', {room: room});
  } else {
    // Run room visuals for remoteRoom  //
    roomVisualHandler(room);

    // Run all timers for remoteRoom //
    timersHandler('remoteRoom', {room: room});
  }
};
// #endregion


// #region Creep handler
const creepHandler = () => {
  _.forEach(Object.keys(Memory.creeps), (creepName) => {
    // Acces Creep object
    const creep = Game.creeps[creepName];

    // Check if creep is dead (undefined) //
    if (creep === undefined) {
      delete Memory.creeps[creepName];
    } else {
      // Else run the creep //
      const creepMemory = Memory.creeps[creepName];
      const creepRoleName = creepMemory.role.split('-')[0];

      // if no role is found, return
      if (!creepRoleName) return;

      // Run the role for the creep
      roleHandler(creep, creepRoleName);
    }
  });
};
// #endregion


// #region Role handler
const roleHandler = (creep, roleName) => {
};
// #endregion


// #region Memory handler
const memoryHandler = (goal, data) => {
  // #region Global memory
  // Get a object back with all the universal memory for a owned and remote room //
  const globalMemory = () => {
    // Timers until the memory Length is the same as last time //
    let memoryLength = 0;
    let endLoop = false;
    while (!endLoop) {
      // Init undefined memory
      if (!Memory.creeps) Memory.creeps = {};
      if (!Memory.flags) Memory.flags = {};
      if (!Memory.stats) Memory.stats = {};

      // Check if current memory size is the same as last loop
      if (memoryLength === Object.keys(Memory).length) {
        Memory.isFilled = true;
        endLoop = true;
      } else memoryLength = Object.keys(Memory).length;
    }
  };
  // #endregion

  // #region Room memory
  // #region Global room memory
  const globalRoomMemory = (room) => {
    // Create a acces point to the flagMemory //
    const flagMemory = Memory.flags[room.name];

    // Needed memory //
    const sources = [];
    room.find(FIND_SOURCES).forEach((source) => {
      // Push the id and position to the memory //
      sources.push({id: source.id, pos: source.pos});
    });


    // Timers until the memory Length is the same as last time //
    let memoryLength = 0;
    let endLoop = false;
    while (!endLoop) {
      // Init undefined memory
      if (!flagMemory.commonMemory) {
        flagMemory.commonMemory = {
          sourceCount: room.find(FIND_SOURCES).length,
          mineral: {
            id: (room.find(FIND_MINERALS)[0]) ? room.find(FIND_MINERALS)[0].id : undefined,
            type: (room.find(FIND_MINERALS)[0]) ? room.find(FIND_MINERALS)[0].mineralType : undefined,
            amount: (room.find(FIND_MINERALS)[0]) ? room.find(FIND_MINERALS)[0].mineralAmount : undefined,
          },
          sources: sources,
          constructionSites: [],
        };
      }
      if (!flagMemory.roomPlanner) flagMemory.roomPlanner = {room: {sources: []}};
      if (!flagMemory.visuals) flagMemory.visuals = {string: '', objects: {}};

      // Check if current memory size is the same as last loop
      if (memoryLength === Object.keys(flagMemory).length) {
        flagMemory.isFilled = true;
        endLoop = true;
      } else memoryLength = Object.keys(flagMemory).length;
    }
  };
  // #endregion

  // #region Owned room memory
  const ownedRoomMemory = (room) => {
    // Create a acces point to the flagMemory //
    const flagMemory = Memory.flags[room.name];

    // Timers until the memory Length is the same as last time //
    let memoryLength = 0;
    let endLoop = false;
    while (!endLoop) {
      // Init undefined memory
      if (!flagMemory.roomPlanner.base) flagMemory.roomPlanner.base = {};
      if (!flagMemory.commonMemory.headSpawnId) flagMemory.commonMemory.headSpawnId = (room.terminal) ? ((room.terminal.findInRange(room.spawns, 2)[0]) ? (room.terminal.findInRange(room.spawns, 2)[0].id) : (room.spawns[0].id)) : (room.spawns[0].id);


      // Check if current memory size is the same as last loop
      if (memoryLength === Object.keys(flagMemory).length) {
        flagMemory.isFilled = true;
        endLoop = true;
      } else memoryLength = Object.keys(flagMemory).length;
    }
  };
  // #endregion

  // #region Remote room memory
  const remoteRoomMemory = (room) => {
    // Create a acces point to the flagMemory //
    const flagMemory = Memory.flags[room.name];

    // Timers until the memory Length is the same as last time //
    let memoryLength = 0;
    let endLoop = false;
    while (!endLoop) {
      // Init undefined memory
      // None

      // Check if current memory size is the same as last loop
      if (memoryLength === Object.keys(flagMemory).length) {
        flagMemory.isFilled = true;
        endLoop = true;
      } else memoryLength = Object.keys(flagMemory).length;
    }
  };
  // #endregion
  // #endregion


  // Switch between te possible goals and get the memory for that goal //
  switch (goal) {
  case 'global':
    globalMemory();
    break;
  case 'ownedRoom':
    globalRoomMemory(data.room);
    ownedRoomMemory(data.room);
    break;
  case 'remoteRoom':
    globalRoomMemory(data.room);
    remoteRoomMemory(data.room);
    break;
  default:
    Game.notify(`Unknown goal: ${goal}, check MemoryHandler.`);
    break;
  }
};


// #endregion


// #region Timers handler
const timersHandler = (goal, data) => {
  // #region Global timers
  // Get a object back with all the universal timers for a owned and remote room //
  const globalTimers = () => {
  };
  // #endregion

  // #region Room timers
  // #region Global room timers
  const globalRoomTimers = (room) => {
    // Run room layout planner each ... ticks //
    if (Game.time % config.rooms.loops.roomPlanner.room === 0) {
      roomPlanner.room(room);
    }
  };
  // #endregion

  // #region Owned room timers
  const ownedRoomTimers = (room) => {
    // Run base layout planner each ... ticks //
    if (Game.time % config.rooms.loops.roomPlanner.base === 0) {
      roomPlanner.base(room);
    }
  };
  // #endregion

  // #region Remote room timers
  const remoteRoomTimers = (room) => {

  };
  // #endregion
  // #endregion

  // Switch between te possible goals and get the timers for that goal //
  switch (goal) {
  case 'global':
    globalTimers();
    break;
  case 'ownedRoom':
    globalRoomTimers(data.room);
    ownedRoomTimers(data.room);
    break;
  case 'remoteRoom':
    globalRoomTimers(data.room);
    remoteRoomTimers(data.room);
    break;
  default:
    Game.notify(`Unknown goal: ${goal}, check TimersHandler.`);
    break;
  }
};
// #endregion


// #region Room visuals handler
const roomVisualHandler = (room) => {
  const flagMemory = Memory.flags[room.name];
  room.visual.import(flagMemory.visuals.string);
};
// #endregion
// #endregion


module.exports = {
  // Global handler //
  // Handles every other handler //
  global: globalHandler,
};
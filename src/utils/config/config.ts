export const Config: Config = {
  username: "PandaMaster",
  whitelist: ["Rivaryn", "Fiskmans"],
  tracking: true,
  // tracking: {
  //   rooms: true,
  //   intents: true,
  //   cpu: true,
  // },
  rooms: {
    minBucket: 1000,
    remoteMinBucket: 3000,
  },
  allRoles: [
    "pioneer",
    "transferer",
    "harvester-0",
    "harvester-1",
    "builder",
    "repairer",
    "upgrader",
    "transfererLD",
    "reserverLD",
    "harvesterLD-0",
    "harvesterLD-1",
    "builderLD",
    "repairerLD",
    "claimerLD",
    "mineral"
  ],
  allCreepModules: ["harvest", "build", "claim", "repair", "reserve", "transfer", "upgrade", "withdraw"],
  creepsCountMax: {
    pioneer: 4,
    transferer: 3,
    harvester: 1,
    builder: 4,
    repairer: 2,
    upgrader: 3,
    reserver: 1,
    claimer: 1,
    mineral: 1
  },
  roleCountByRoomByRole: {},
  cpuUsedByRoomByRole: {},

  creepModuleCpuCost: {},
  expenses: { spawnExpenses: {}, building: {}, repairing: {}, upgrading: {} },
  income: { ownedHarvesting: {}, remoteHarvesting: {} }
};

const getAccesPoints = require('function.getAccesPoints');

const runLabs = require('module.labs')

const runMainSystem = require('function.mainSystem');
const terminal = require('module.terminal')


module.exports = {
  setup: function(roomName) {
    const room = Game.rooms[roomName];

    const flagMemory = Memory.flags[roomName];
    const mainSystemMemory = Memory.mainSystem;


    (!Memory.flags) ? (Memory.flags = {});
    (!Memory.stats) ? (Memory.stats = {});
    if (!Memory.cpuTracker) {
      Memory.cpuTracker = {};
      Memory.cpuTracker["loadMemory"] = 0;
      Memory.cpuTracker["runCreeps"] = 0;
      Memory.cpuTracker["tracker"] = 0;
      Memory.cpuTracker["countCreepsAndParts"] = 0;
      Memory.cpuTracker["terminal"] = 0;
      Memory.cpuTracker["labs"] = 0;
    }
    if (!Memory.mainSystem) {
      Memory.mainSystem = {};
      Memory.mainSystem["cpuTracker"] = 0;
      Memory.mainSystem["cpuAvgTicks"] = 0;
      Memory.mainSystem["performanceTracker"] = 0;
      Memory.mainSystem["performanceAvgTicks"] = 0;
    }
    (!Memory.terminal) ? (terminal.setup());
    (!Memory.performanceTracker) ? (Memory.performanceTracker = {});

    if (!flagMemory.roomManager) {
      flagMemory.roomManager = {};
      (!flagMemory.sources) ? (flagMemory.sources = []);
      room.find(FIND_SOURCES).forEach((source, i) => {
        flagMemory.sources[i] = {};
        flagMemory.sources[i].id = source.id;
        flagMemory.sources[i].openSpots = getAccesPoints.run(source.pos.x,source.pos.y, roomName)[0]

        flagMemory.roomManager[`source-${i}.HasStructure`] = false;
      });

      flagMemory.roomManager[`controller.HasStructure`] = false;



      (!flagMemory.links) ? (flagMemory.links = {});
      (!flagMemory.controllerLevel) ? (flagMemory.controllerLevel = {});
      (!flagMemory.constructionSitesAmount) ? (flagMemory.constructionSitesAmount = {});
      (!flagMemory.enemyCreepCount) ? (flagMemory.enemyCreepCount = {});
      (!flagMemory.enemys) ? (flagMemory.enemys = []);
      (!flagMemory.towerTarget) ? (flagMemory.towerTarget = "");
      (!flagMemory.repairTarget) ? (flagMemory.repairTarget = []);
      (!flagMemory.boosting) ? (flagMemory.boosting = {});
      (!flagMemory.unBoost) ? (flagMemory.unBoost = {});
      (!flagMemory.repairTargetAmount) ? (flagMemory.repairTargetAmount = 100 * 1000);
      (!flagMemory.labs) ? (runLabs.setup(roomName));

      if (!flagMemory.mineralId) {
        const mineral = room.find(FIND_MINERALS)[0];
        if (mineral) {
          // Save The MineralAmount And Id //
          flagMemory.mineralAmount = mineral.mineralAmount;
          flagMemory.mineralId = mineral.id;
          flagMemory.mineralType = mineral.mineralType;
        }
        else {
          // Set It At Undefined So Code Doesn't Break But Is Empty //
          flagMemory.mineralAmount = 0;
          flagMemory.mineralId = "";
          flagMemory.mineralType = "";
        }
      }

      if (!flagMemory.rolesCount) {
        // Define All Role's //
        flagMemory.rolesCount = {};
        flagMemory.rolesCount["harvester-0"] = 0;
        flagMemory.rolesCount["harvester-1"] = 0;
        flagMemory.rolesCount["transferer"] = 0;
        flagMemory.rolesCount["transfererLiTe"] = 0;
        flagMemory.rolesCount["builder"] = 0;
        flagMemory.rolesCount["upgrader"] = 0;
        flagMemory.rolesCount["repairer"] = 0;
        flagMemory.rolesCount["extractor"] = 0;
        flagMemory.rolesCount["claimer"] = 0;
        flagMemory.rolesCount["attacker"] = 0;
        flagMemory.rolesCount["builderLD"] = 0;
        flagMemory.rolesCount["ruinWithdrawer"] = 0;
        flagMemory.rolesCount["reserverLD"] = 0;
        flagMemory.rolesCount["harvesterLD-0"] = 0;
        flagMemory.rolesCount["harvesterLD-1"] = 0;
        flagMemory.rolesCount["harvesterLD-2"] = 0;
        flagMemory.rolesCount["harvesterLD-3"] = 0;
        flagMemory.rolesCount["transfererLD"] = 0;
        flagMemory.rolesCount["scientist"] = 0;
      }

      if (!flagMemory.partsAmount) {
        // Define ALl Important Roles With Their Parts //
        flagMemory.partsAmount = {};
        flagMemory.partsAmount["harvester-0-WORK"] = 0;
        flagMemory.partsAmount["harvester-1-WORK"] = 0;
        flagMemory.partsAmount["transferer-CARRY"] = 0;
        flagMemory.partsAmount["transfererLiTe-CARRY"] = 0;
        flagMemory.partsAmount["builder-WORK"] = 0;
        flagMemory.partsAmount["upgrader-WORK"] = 0;
        flagMemory.partsAmount["repairer-WORK"] = 0;
        flagMemory.partsAmount["extractor-WORK"] = 0;
        flagMemory.partsAmount["claimer-CLAIM"] = 0;
        flagMemory.partsAmount["attacker-RANGED_ATTACK"] = 0;
        flagMemory.partsAmount["builderLD-WORK"] = 0;
        flagMemory.partsAmount["ruinWithdrawer-CARRY"] = 0;
        flagMemory.partsAmount["reserverLD-CLAIM"] = 0;
        flagMemory.partsAmount["harvesterLD-0-WORK"] = 0;
        flagMemory.partsAmount["harvesterLD-1-WORK"] = 0;
        flagMemory.partsAmount["harvesterLD-2-WORK"] = 0;
        flagMemory.partsAmount["harvesterLD-3-WORK"] = 0;
        flagMemory.partsAmount["harvesterLD-2"] = 0;
        flagMemory.partsAmount["transfererLD-CARRY"] = 0;
      }

      if (!flagMemory.trackers) {
        flagMemory.trackers = {};

        flagMemory.trackers.room = {};
        let roomTracker = flagMemory.trackers.room;
        roomTracker["rclProgress"] = 0;
        roomTracker["rclProgressTotal"] = 0;
        roomTracker["spawnAvailability"] = 0;
        roomTracker["energyStored"] = 0;

        flagMemory.trackers.cpu = {};
        let cpuTracker = flagMemory.trackers.cpu;
        cpuTracker["runTowers"] = 0;
        cpuTracker["getDamagedStructures"] = 0;
        cpuTracker["runGameTimeTimers"] = 0;
        cpuTracker["runRoomManager"] = 0;
        cpuTracker["terminal"] = 0;
        cpuTracker["labs"] = 0;

        flagMemory.trackers.cpuCreeps = {};
        let cpuTrackerCreeps = flagMemory.trackers.cpuCreeps;
        cpuTrackerCreeps["harvester-0"] = 0;
        cpuTrackerCreeps["harvester-1"] = 0;
        cpuTrackerCreeps["transferer"] = 0;
        cpuTrackerCreeps["transfererLiTe"] = 0;
        cpuTrackerCreeps["builder"] = 0;
        cpuTrackerCreeps["upgrader"] = 0;
        cpuTrackerCreeps["repairer"] = 0;
        cpuTrackerCreeps["extractor"] = 0;
        cpuTrackerCreeps["claimer"] = 0;
        cpuTrackerCreeps["attacker"] = 0;
        cpuTrackerCreeps["builderLD"] = 0;
        cpuTrackerCreeps["ruinWithdrawer"] = 0;
        cpuTrackerCreeps["reserverLD"] = 0;
        cpuTrackerCreeps["harvesterLD-0"] = 0;
        cpuTrackerCreeps["harvesterLD-1"] = 0;
        cpuTrackerCreeps["harvesterLD-2"] = 0;
        cpuTrackerCreeps["harvesterLD-3"] = 0;
        cpuTrackerCreeps["transfererLD"] = 0;
        cpuTrackerCreeps["scientist"] = 0;

        flagMemory.trackers.cpuModule = {};
        let cpuTrackerModule = flagMemory.trackers.cpuModule;
        cpuTrackerModule["harvestModule"] = 0;
        cpuTrackerModule["upgradeModule"] = 0;
        cpuTrackerModule["transferModule"] = 0;
        cpuTrackerModule["withdrawModule"] = 0;
        cpuTrackerModule["buildModule"] = 0;
        cpuTrackerModule["repairModule"] = 0;

        flagMemory.trackers.performance = {};
        const performanceTracker = flagMemory.trackers.performance;
        performanceTracker["harvesterEnergy"] = 0;
        performanceTracker["harvesterLDEnergy"] = 0;
        performanceTracker["transfererEnergy"] = 0;
        performanceTracker["builderEnergy"] = 0;
        performanceTracker["repairerEnergy"] = 0;
        performanceTracker["spawnerEnergy"] = 0;

        flagMemory.trackers.spawner = {};
        const spawnerTracker = flagMemory.trackers.spawner;
        spawnerTracker["harvester-0"] = 0;
        spawnerTracker["harvester-1"] = 0;
        spawnerTracker["transferer"] = 0;
        spawnerTracker["transfererLiTe"] = 0;
        spawnerTracker["builder"] = 0;
        spawnerTracker["upgrader"] = 0;
        spawnerTracker["repairer"] = 0;
        spawnerTracker["extractor"] = 0;
        spawnerTracker["claimer"] = 0;
        spawnerTracker["attacker"] = 0;
        spawnerTracker["builderLD"] = 0;
        spawnerTracker["ruinWithdrawer"] = 0;
        spawnerTracker["reserverLD"] = 0;
        spawnerTracker["harvesterLD-0"] = 0;
        spawnerTracker["harvesterLD-1"] = 0;
        spawnerTracker["harvesterLD-2"] = 0;
        spawnerTracker["harvesterLD-3"] = 0;
        spawnerTracker["transfererLD"] = 0;
        spawnerTracker["scientist"] = 0;
      }
      flagMemory.IsMemorySetup = true;
    }
  }
};

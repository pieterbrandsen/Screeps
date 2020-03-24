module.exports = {
  run: function(creep) {
    let start = Game.cpu.getUsed();

    // Set Working State
    let creepCarryCapacity = creep.store.getCapacity();
    let creepCarryUsedCapacity = creep.store.getUsedCapacity();
    if (creep.memory.working === true && creepCarryUsedCapacity === 0) {
      creep.memory.working = false;
    }
    else if (creep.memory.working === false && creepCarryUsedCapacity == creepCarryCapacity) {
      creep.memory.working = true;
    }

    // Create required Memory if empty
    if (!creep.memory.link) {
      creep.memory.link = {}
    }
    if (!creep.memory.container) {
      creep.memory.container = {}
    }
    if (!creep.memory.targetId) {
      creep.memory.targetId = ""
    }
    if (!creep.memory.targetId2) {
      creep.memory.targetId2 = ""
    }
    if (!creep.memory.repairerMode) {
      creep.memory.repairerMode = ""
    }


    let flag = Game.rooms[creep.room.name];
    let mode = creep.memory.repairerMode;


    if (creep.memory.working === true) {
      // If creep has no target
      if (Game.time % 5 == 0) {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART
        });
        if (target !== null) {
          creep.memory.targetId = target.id
        }

      }
      // If creep has target
      if (Game.getObjectById(creep.memory.targetId) !== null) {
        let target = Game.getObjectById(creep.memory.targetId)
        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
          creep.travelTo(target)
        }
      }
    }
    else if (creep.memory.working === false) {
      let room = Game.rooms[creep.room.name];

      // If creep has no main pickup goal
      if (creep.memory.repairerMode.length == 0) {
        let container = creep.pos.findClosestByRange(creep.room.containers, {
          filter: (structure) => {
            return (!structure.pos.inRangeTo(creep.room.controller,5));
          }
        });

        if (creep.room.terminal !== undefined) {
          creep.memory.repairerMode = "terminal";
        }
        else if (creep.room.storage !== undefined && creep.room.terminal == undefined && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 10000) {
            creep.memory.repairerMode = "storage";
        }
        else if (container !== null) {
          creep.memory.targetId2 = container.id;
          creep.memory.repairerMode = "object";
        }
      }
      // If creep has main pickup goal
      if (creep.memory.repairerMode.length > 0) {
        if (mode == "terminal") {
          // Withdraw from terminal
          if (creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.terminal)
          }
        }
        else if (mode == "storage") {
          // Withdraw from storage and check if enough energy
          if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > creepCarryCapacity) {
            if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.travelTo(creep.room.storage)
            }
          }
          else {
            creep.memory.transfererMode = "";
          }
        }
        else if (mode == "object") {
          let target = Game.getObjectById(creep.memory.targetId2)

          //Go transfer
          if (target !== null) {
            if (target.store.getUsedCapacity(RESOURCE_ENERGY) > creepCarryCapacity) {
              if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target)
              }
            }
            else if (target.store.getUsedCapacity(RESOURCE_ENERGY) < creepCarryCapacity && Game.time % 10 == 0) {
              if (target.structureType == STRUCTURE_CONTAINER) {
                let container = creep.pos.findClosestByRange(creep.room.containers, {
                  filter: (structure) => {
                    return (!structure.pos.inRangeTo(creep.room.controller,5) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > target.store.getUsedCapacity(RESOURCE_ENERGY));
                  }
                });

                if (container !== null) {
                  creep.memory.targetId2 = container.id
                }
              }
            }
          }
          else {
            creep.memory.repairerMode = "";
          }
        }
        else if (mode == "source") {
          // If all other mode return false

          // If creep has no source
          if (_.size(creep.memory.source) == 0 || Game.time % 250 == 0) {
            creep.memory.source = creep.pos.findClosestByRange(FIND_SOURCES).id;
          }

          // If creep has source
          else if (_.size(creep.memory.source) > 0) {
            let target = Game.getObjectById(creep.memory.source);
            if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
              creep.travelTo(target)
            }
          }
        }
      }
      // If there are problems, get notified
      else {
        Game.notify("ERR: This room's " + creep.memory.role + " cant Withdraw (" + creep.room.name + ")!")
      }
    }

    flag.repairerCpu += Game.cpu.getUsed() - start
  }
};

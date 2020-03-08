module.exports = {
    run: function(creep) {
        if (creep.memory.working === true && _.sum(creep.carry) === 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working === false && _.sum(creep.carry) === creep.carryCapacity) {
            creep.memory.working = true;
        }
        if (!creep.memory.link) {
            creep.memory.link = {}
        }
        if (!creep.memory.container) {
            creep.memory.container = {}
        }

        if (creep.memory.working === false) {
            if (creep.memory.sourceId !== undefined) {
                let target = Game.getObjectById(creep.memory.sourceId);
                if (target.energy > 0) {
                    if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(target)
                    }
                }
            }
            else {console.log("This creep has no source! - " + creep.room.name + " - " + creep.name)}
        }
        else if (creep.memory.working === true) {
            if ((_.size(creep.memory.link) == 0 || _.size(creep.memory.link) == null) || Game.time % 250 == 0) {
                creep.memory.link = creep.pos.findClosestByRange(creep.room.links, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_LINK);
                    }
                });
            }
            if ((_.size(creep.memory.container) == 0 || _.size(creep.memory.container) == null) || Game.time % 250 == 0) {
                creep.memory.container = creep.pos.findClosestByRange(creep.room.containers, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_CONTAINER);
                    }
                });
            }

            if (creep.room.links.length > 2 && _.size(creep.memory.link) > 0) {
                let link = Game.getObjectById(creep.memory.link.id);
                if (creep.transfer(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(link)
                }
            }
            else if (creep.room.links.length < 2 && creep.room.containers.length > 0 && _.size(creep.memory.container) > 0) {
                let container = Game.getObjectById(creep.memory.container.id);

                if (creep.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(container)
                }
            }
            else if (creep.room.links.length < 2 && creep.room.containers.length == 0 && creep.room.terminal !== undefined) {
                if (creep.transfer(creep.room.terminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(creep.room.terminal)
                }
            }
            else {
                let target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_SPAWN
                        || s.structureType === STRUCTURE_EXTENSION
                        || s.structureType === STRUCTURE_TOWER && s.energy < 500 && creep.store[RESOURCE_ENERGY] >= 150)
                        && s.energy < s.energyCapacity
                });
                if (target !== null) {
                    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(target)
                    }
                }
            }
        }

        function needsCreeps(role, numbers) {
            let numberOfCreeps = _.sum(Game.creeps, (c) => c.memory.role === role && c.memory.room === creep.room.name);
            return numberOfCreeps < numbers
        }
        if (creep.memory.role == "harvesterSo1" && needsCreeps("harvester1",1) ==  false) {
            creep.suicide();
        }
        if (creep.memory.role == "harvesterSo2" && needsCreeps("harvester2",1) ==  false) {
            creep.suicide();
        }
    }
};

module.exports = {
  run: function(creep) {
    // Set Working State
    let creepCarryCapacity = creep.store.getCapacity();
    let creepCarryUsedCapacity = creep.store.getUsedCapacity();
    if (creep.memory.working === true && creepCarryUsedCapacity === 0) {
      creep.memory.working = false;
    }
    else if (creep.memory.working === false && creepCarryUsedCapacity == creepCarryCapacity) {
      creep.memory.working = true;
    }

    let flag = Memory.flags[creep.room.name];
    function needsCreeps(role, numbers) {
        let numberOfCreeps = _.sum(Game.creeps, (c) => c.memory.role === role && c.memory.room === creep.room.name);
        return numberOfCreeps < numbers
    }

    // Create required Memory if empty
    if (!creep.memory.link) {
      creep.memory.link = ""
    }
    if (!creep.memory.container) {
      creep.memory.container = ""
    }
    if (!creep.memory.container2) {
        creep.memory.container2 = ""
    }
    if (!creep.memory.targetId) {
      creep.memory.targetId = ""
    }
    if (!flag.harvesterMode) {
      flag.harvesterMode = ""
    }
    if (!creep.memory.harvesterMode) {
      creep.memory.harvesterMode = ""
    }


    if (creep.memory.working === false) {
      // If creep has no target

      if (creep.memory.sourceId !== undefined) {
          let target = Game.getObjectById(creep.memory.sourceId);
          if (target.energy > 0) {
              if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
                  creep.travelTo(target)
              }
          }
      }
      else {console.log("This creep has no source! - " + creep.room.name + " - " + creep.name)}
      if (creep.memory.sourceId == null) {
        // Assign sourceId
        if (creep.memory.role.includes("1") == true) {
          creep.memory.sourceId = flag.sources[0];
        }
        else if (creep.memory.role.includes("2") == true) {
          creep.memory.sourceId = flag.sources[1];
        }
      }
      // If creep has target
      if (creep.memory.sourceId !== null) {
        let target = Game.getObjectById(creep.memory.sourceId);
        if (target.energy > 0) {
            if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
                creep.travelTo(target)
            }
        }
      }
    }
    else if (creep.memory.working === true) {
      let mode = creep.memory.harvesterMode;
      let room = Game.rooms[creep.room.name];
      let target = creep.memory.targetId;


      // If creep has no main pickup goal
      if (flag.harvesterMode.length == 0) {

        // Define variables
        let source = Game.getObjectById(creep.memory.targetId)
        let container = creep.pos.findClosestByRange(creep.room.containers, {
            filter: (structure) => {
                return (structure.pos.inRangeTo(source, 2));
            }
        });
        let link = creep.pos.findClosestByRange(creep.room.links, {
            filter: (structure) => {
                return (structure.pos.inRangeTo(source, 2));
            }
        });

        // If container is found
        if (container !== null) {
          flag.harvesterMode = "object";
          creep.memory.targetId = creep.pos.findClosestByRange(creep.room.containers, {
              filter: (structure) => {
                  return (structure.pos.inRangeTo(source, 2));
              }
          }).id;
        }

        // If link is found
        else if (link !== null) {
          flag.harvesterMode = "object";
          creep.memory.targetId= creep.pos.findClosestByRange(creep.room.links, {
              filter: (structure) => {
                  return (structure.pos.inRangeTo(source, 2));
              }
          }).id;
        }
        // If creep need to wait or build new object
        else if (creep.room.controller.level >= 2) {
          // Here check if creep needs link or wait
          let amount;
          let amount2;
          function buildConstructionSite(input, source) {
            let sourceObject = Game.getObjectById(source);
            let structureType;
            let x = sourceObject.pos.x;
            let y = sourceObject.pos.y;
            function createConstruction(structureType,x,y) {
              if (creep.room.createConstructionSite(x,y,structureType) == 0) {
                return true;
              }
              else {
                return false;
              }
            }

            if (input == "container") {
              structureType = STRUCTURE_CONTAINER;
            }
            else if (input == "link") {
              structureType = STRUCTURE_LINK;
            }

            if (createConstruction(structureType,x+1,y+1) == true) {
              creep.room.createConstructionSite(x+1,y+1,structureType)
              return true
            }
            else if (createConstruction(structureType,x,y+1) == true) {
              creep.room.createConstructionSite(x+1,y+1,structureType)
              return true
            }
            else if (createConstruction(structureType,x-1,y+1) == true) {
              creep.room.createConstructionSite(x+1,y+1,structureType)
              return true
            }
            else if (createConstruction(structureType,x-1,y) == true) {
              creep.room.createConstructionSite(x+1,y+1,structureType)
              return true
            }
            else if (createConstruction(structureType,x-1,y-1) == true) {
              creep.room.createConstructionSite(x+1,y+1,structureType)
              return true
            }
            else if (createConstruction(structureType,x,y-1) == true) {
              creep.room.createConstructionSite(x+1,y+1,structureType)
              return true
            }
            else if (createConstruction(structureType,x+1,y-1) == true) {
              creep.room.createConstructionSite(x+1,y+1,structureType)
              return true
            }
            else if (createConstruction(structureType,x,y-1) == true) {
              creep.room.createConstructionSite(x+1,y+1,structureType)
              return true
            }
            else {
              return false
            }
          }

          if (creep.room.controller.level == 1) {
            amount = 5;
            if (creep.room.containers.length == amount && (needsCreeps("transferer1",1) ==  false || needsCreeps("transfererSo1",1) ==  false)) {
              flag.harvesterMode = "source";
              creep.memory.harvesterMode = "source";
            }
            else if (creep.room.containers.length < amount) {
              buildConstructionSite("container",creep.memory.sourceId);
              flag.harvesterMode = "build";
              creep.memory.harvesterMode = "build";
            }
          }
          else if (creep.room.controller.level == 2) {
            amount = 5;
            if (creep.room.containers.length == amount && (needsCreeps("transferer1",1) ==  false || needsCreeps("transfererSo1",1) ==  false)) {
              flag.harvesterMode = "source";
              creep.memory.harvesterMode = "source";
            }
            else if (creep.room.containers.length < amount) {
              buildConstructionSite("container",creep.memory.sourceId);
              flag.harvesterMode = "build";
              creep.memory.harvesterMode = "build";
            }
          }
          else if (creep.room.controller.level == 3) {
            amount = 5;
            if (creep.room.containers.length == amount && (needsCreeps("transferer1",1) ==  false || needsCreeps("transfererSo1",1) ==  false)) {
              flag.harvesterMode = "source";
              creep.memory.harvesterMode = "source";
            }
            else if (creep.room.containers.length < amount) {
              buildConstructionSite("container",creep.memory.sourceId);
              flag.harvesterMode = "build";
              creep.memory.harvesterMode = "build";
            }
          }
          if (creep.room.controller.level == 4) {
            amount = 5;
            if (creep.room.containers.length == amount && (needsCreeps("transferer1",1) ==  false || needsCreeps("transfererSo1",1) ==  false)) {
              flag.harvesterMode = "source";
              creep.memory.harvesterMode = "source";
            }
            else if (creep.room.containers.length < amount) {
              buildConstructionSite("container",creep.memory.sourceId);
              flag.harvesterMode = "build";
              creep.memory.harvesterMode = "build";
            }
          }
          else if (creep.room.controller.level == 5) {
            amount = 2;
            if (creep.room.links.length == amount && (needsCreeps("transferer1",1) ==  false || needsCreeps("transfererSo1",1) ==  false)) {
              if (creep.room.containers.length < 5) {
                buildConstructionSite("container",creep.memory.sourceId);
                flag.harvesterMode = "build";
                creep.memory.harvesterMode = "build";
              }
              else {
              flag.harvesterMode = "source";
              creep.memory.harvesterMode = "source";
              }
            }
            else if (creep.room.links.length < amount) {
              buildConstructionSite("link",creep.memory.sourceId);
              flag.harvesterMode = "build";
              creep.memory.harvesterMode = "build";
            }
          }
          else if (creep.room.controller.level == 6) {
            amount = 3;
            if (creep.room.links.length == amount && (needsCreeps("transferer1",1) ==  false || needsCreeps("transfererSo1",1) ==  false)) {
              if (creep.room.containers.length < 5) {
                buildConstructionSite("container",creep.memory.sourceId);
                flag.harvesterMode = "build";
                creep.memory.harvesterMode = "build";
              }
              else {
              flag.harvesterMode = "source";
              creep.memory.harvesterMode = "source";
              }
            }
            else if (creep.room.links.length < amount) {
              buildConstructionSite("link",creep.memory.sourceId);
              flag.harvesterMode = "build";
              creep.memory.harvesterMode = "build";
            }
          }
          else if (creep.room.controller.level >= 7) {
            amount = 4;
            if (creep.room.links.length == amount && (needsCreeps("transferer1",1) ==  false || needsCreeps("transfererSo1",1) ==  false)) {
              if (creep.room.containers.length < 5) {
                buildConstructionSite("container",creep.memory.sourceId);
                flag.harvesterMode = "build";
                creep.memory.harvesterMode = "build";
              }
              else {
              flag.harvesterMode = "source";
              creep.memory.harvesterMode = "source";
              }
            }
            else if (creep.room.links.length < amount) {
              buildConstructionSite("link",creep.memory.sourceId);
              flag.harvesterMode = "build";
              creep.memory.harvesterMode = "build";
            }
          }
          else {
            flag.harvesterMode = "source"
            creep.memory.harvesterMode = "source";
          }
        }
      }
      // If creep has main pickup goal
      if (flag.harvesterMode.length > 0) {
        if (mode == "object") {
          // Assign linkId for later transfering
          if (target.structureType == link && creep.memory.role.includes("1") == true && creep.memory.link2 == undefined) {
            creep.memory.link2 = target.id;
          }
          else if (target.structureType == link && creep.memory.role.includes("2") == true && creep.memory.link3 == undefined) {
            creep.memory.link3 = target.id;
          }

          // Go transfer
          if (target.store.getUsedCapacity(RESOURCE_ENERGY) < target.store.getCapacity()) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.travelTo(target)
            }
          }
        }
        else if (mode == "build") {
          // If creep needs to build target
          if (Game.getObjectById(creep.memory.targetId) == null) {
            // If there is no target
            let constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
              filter: (structure) => {
                return (structure.pos.inRangeTo(source, 2));
              }
            }).id;
            if (constructionSites == null) {
              mode = ""
              flag.constructions = room.find(FIND_CONSTRUCTION_SITES);
            }
            // Else get new target
            else {
              creep.memory.targetId = creep.pos.findInRange(FIND_CONSTRUCTION_SITES,2).id
            }
          }
          // If creep has target
          if (Game.getObjectById(creep.memory.targetId) !== null) {
            let target = Game.getObjectById(creep.memory.targetId)
            if (creep.build(target) === ERR_NOT_IN_RANGE) {
              creep.travelTo(target)
            }
          }
        }
        else if (mode == "source") {
          // If creep has no target
          if (Game.getObjectById(creep.memory.targetId) == null) {
            // If there is no target
            creep.memory.targetId = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
              filter: (s) => (s.structureType === STRUCTURE_SPAWN
              || s.structureType === STRUCTURE_EXTENSION)
              && s.energy < s.energyCapacity
            }).id;
          }
          // If creep has target
          if (Game.getObjectById(creep.memory.targetId) !== null) {
            let target = Game.getObjectById(creep.memory.targetId)
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
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

    if (creep.memory.role == "harvesterSo1" && needsCreeps("harvester1",1) ==  false) {
        creep.suicide();
    }
    if (creep.memory.role == "harvesterSo2" && needsCreeps("harvester2",1) ==  false) {
        creep.suicide();
    }
  }
};
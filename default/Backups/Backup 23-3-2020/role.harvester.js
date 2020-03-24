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

    let flag = Memory.flags[creep.room.name];
    let source = Game.getObjectById(creep.memory.sourceId)

    function needsCreeps(role, numbers) {
        let numberOfCreeps = _.sum(Game.creeps, (c) => c.memory.role === role && c.memory.room === creep.room.name);
        return numberOfCreeps < numbers
    }

    // Create required Memory if empty
    if (!creep.memory.targetId) {
      creep.memory.targetId = ""
    }
    if (!creep.memory.harvesterMode) {
      creep.memory.harvesterMode = ""
    }
    if (!flag) {
      creep.room.createFlag(25,25, creep.room.name)
      Memory.flags[creep.room.name] = {}
    }

    else if (!flag.harvesterMode && flag) {
      flag.harvesterMode = ""
    }


    if (creep.memory.working === false) {
      let target = Game.getObjectById(creep.memory.sourceId);

      // If creep has target
      if (creep.memory.sourceId !== undefined) {
        if (target.energy > 0) {
          if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
            creep.travelTo(target)
          }
        }
      }

      else if (creep.memory.sourceId == undefined) {
        // Assign sourceId
        if (creep.memory.role.includes("1") == true) {
          creep.memory.sourceId = flag.sources[0];
        }
        else if (creep.memory.role.includes("2") == true) {
          creep.memory.sourceId = flag.sources[1];
        }
      }


      else {
        console.log("This creep has no source! - " + creep.room.name + " - " + creep.name)
      }
    }

    if (creep.memory.working === true) {
      let mode = creep.memory.harvesterMode;
      let room = Game.rooms[creep.room.name];
      let target = Game.getObjectById(creep.memory.targetId);


      // If creep has no main pickup goal
      if (creep.memory.harvesterMode.length == 0) {
        // Define variables
        let source = Game.getObjectById(creep.memory.sourceId)
        let container = creep.pos.findClosestByRange(creep.room.containers, {
          filter: (structure) => {
            return (structure.pos.inRangeTo(source,3));
          }
        });
        let link = creep.pos.findClosestByRange(creep.room.links, {
          filter: (structure) => {
            return (structure.pos.inRangeTo(source,3));
          }
        });
        let constructionSite = source.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
          filter: (structure) => {
            return (structure.pos.inRangeTo(source, 3));
          }
        });

        //If link is found
        if (link !== null) {
          creep.memory.harvesterMode = "object";
          creep.memory.targetId = link.id;
        }

        // If container is found
        else if (container !== null) {
          creep.memory.harvesterMode = "object";
          creep.memory.targetId = container.id;
        }
        else if (constructionSite !== null) {
          creep.memory.harvesterMode = "build";
        }
        else {creep.memory.harvesterMode = "source";}

        // If creep need to wait or build new object
        // else {
        //   // Here check if creep needs link or wait
        //   let amount;
        //   let amount2;
        //   function buildConstructionSite(input, source) {
        //     let sourceObject = Game.getObjectById(source);
        //     let structureType;
        //     let x = sourceObject.pos.x;
        //     let y = sourceObject.pos.y;
        //     function createConstruction(structureType,x,y) {
        //       if (creep.room.createConstructionSite(x,y,structureType) == 0) {
        //         return true;
        //       }
        //       else {
        //         return false;
        //       }
        //     }
        //
        //     if (input == "container") {
        //       structureType = STRUCTURE_CONTAINER;
        //     }
        //     else if (input == "link") {
        //       structureType = STRUCTURE_LINK;
        //     }
        //
        //     if (createConstruction(structureType,x+1,y+1) == true) {
        //       creep.room.createConstructionSite(x+1,y+1,structureType)
        //       return true
        //     }
        //     else if (createConstruction(structureType,x,y+1) == true) {
        //       creep.room.createConstructionSite(x+1,y+1,structureType)
        //       return true
        //     }
        //     else if (createConstruction(structureType,x-1,y+1) == true) {
        //       creep.room.createConstructionSite(x+1,y+1,structureType)
        //       return true
        //     }
        //     else if (createConstruction(structureType,x-1,y) == true) {
        //       creep.room.createConstructionSite(x+1,y+1,structureType)
        //       return true
        //     }
        //     else if (createConstruction(structureType,x-1,y-1) == true) {
        //       creep.room.createConstructionSite(x+1,y+1,structureType)
        //       return true
        //     }
        //     else if (createConstruction(structureType,x,y-1) == true) {
        //       creep.room.createConstructionSite(x+1,y+1,structureType)
        //       return true
        //     }
        //     else if (createConstruction(structureType,x+1,y-1) == true) {
        //       creep.room.createConstructionSite(x+1,y+1,structureType)
        //       return true
        //     }
        //     else if (createConstruction(structureType,x,y-1) == true) {
        //       creep.room.createConstructionSite(x+1,y+1,structureType)
        //       return true
        //     }
        //     else {
        //       return false
        //     }
        //   }
        //
        //   if (creep.room.controller.level == 1) {
        //     amount = 5;
        //     if (creep.room.containers.length == amount) {
        //       creep.memory.harvesterMode = "source";
        //       creep.memory.harvesterMode = "source";
        //     }
        //     else if (creep.room.containers.length < amount) {
        //       buildConstructionSite("container",creep.memory.sourceId);
        //       creep.memory.harvesterMode = "build";
        //       creep.memory.harvesterMode = "build";
        //     }
        //   }
        //   else if (creep.room.controller.level == 2) {
        //     amount = 5;
        //     if (creep.room.containers.length == amount) {
        //       creep.memory.harvesterMode = "source";
        //       creep.memory.harvesterMode = "source";
        //     }
        //     else if (creep.room.containers.length < amount) {
        //       buildConstructionSite("container",creep.memory.sourceId);
        //       creep.memory.harvesterMode = "build";
        //       creep.memory.harvesterMode = "build";
        //     }
        //   }
        //   else if (creep.room.controller.level == 3) {
        //     amount = 5;
        //     if (creep.room.containers.length == amount) {
        //       creep.memory.harvesterMode = "source";
        //       creep.memory.harvesterMode = "source";
        //     }
        //     else if (creep.room.containers.length < amount) {
        //       buildConstructionSite("container",creep.memory.sourceId);
        //       creep.memory.harvesterMode = "build";
        //       creep.memory.harvesterMode = "build";
        //     }
        //   }
        //   if (creep.room.controller.level == 4) {
        //     amount = 5;
        //     if (creep.room.containers.length == amount) {
        //       creep.memory.harvesterMode = "source";
        //       creep.memory.harvesterMode = "source";
        //     }
        //     else if (creep.room.containers.length < amount) {
        //       buildConstructionSite("container",creep.memory.sourceId);
        //       creep.memory.harvesterMode = "build";
        //       creep.memory.harvesterMode = "build";
        //     }
        //   }
        //   else if (creep.room.controller.level == 5) {
        //     amount = 2;
        //     if (creep.room.links.length == amount) {
        //       if (creep.room.containers.length < 5 && transfererMode == "container") {
        //         buildConstructionSite("container",creep.memory.sourceId);
        //         creep.memory.harvesterMode = "build";
        //         creep.memory.harvesterMode = "build";
        //       }
        //       else {
        //       creep.memory.harvesterMode = "source";
        //       creep.memory.harvesterMode = "source";
        //       }
        //     }
        //     else if (creep.room.links.length < amount) {
        //       buildConstructionSite("link",creep.memory.sourceId);
        //       creep.memory.harvesterMode = "build";
        //       creep.memory.harvesterMode = "build";
        //     }
        //   }
        //   else if (creep.room.controller.level == 6) {
        //     amount = 3;
        //     if (creep.room.links.length == amount) {
        //       if (creep.room.containers.length < 5 && transfererMode == "container") {
        //         buildConstructionSite("container",creep.memory.sourceId);
        //         creep.memory.harvesterMode = "build";
        //         creep.memory.harvesterMode = "build";
        //       }
        //       else {
        //       creep.memory.harvesterMode = "source";
        //       creep.memory.harvesterMode = "source";
        //       }
        //     }
        //     else if (creep.room.links.length < amount) {
        //       buildConstructionSite("link",creep.memory.sourceId);
        //       creep.memory.harvesterMode = "build";
        //       creep.memory.harvesterMode = "build";
        //     }
        //   }
        //   else if (creep.room.controller.level >= 7) {
        //     amount = 4;
        //     if (creep.room.links.length == amount) {
        //       if (creep.room.containers.length < 5 && transfererMode == "container") {
        //         buildConstructionSite("container",creep.memory.sourceId);
        //         creep.memory.harvesterMode = "build";
        //         creep.memory.harvesterMode = "build";
        //       }
        //       else {
        //       creep.memory.harvesterMode = "source";
        //       creep.memory.harvesterMode = "source";
        //       }
        //     }
        //     else if (creep.room.links.length < amount) {
        //       buildConstructionSite("link",creep.memory.sourceId);
        //       creep.memory.harvesterMode = "build";
        //       creep.memory.harvesterMode = "build";
        //     }
        //   }
        //   else {
        //     creep.memory.harvesterMode = "source"
        //     creep.memory.harvesterMode = "source";
        //   }
        // }
      }
      // If creep has main pickup goal
      else if (creep.memory.harvesterMode.length > 0) {
        if (mode == "object") {
          let target = Game.getObjectById(creep.memory.targetId)

          //Go transfer
          if (target !== null) {
            if (target.store.getFreeCapacity(RESOURCE_ENERGY) > creepCarryUsedCapacity) {
              if (creep.transfer(target, RESOURCE_ENERGY) == 0) {
              }
              else if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target)
              }
            }
            if (creep.memory.role.includes('So') == true && target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
              creep.memory.harvesterMode = "source";
            }
        	}
          else {
            mode = "";
          }

        }
        else if (mode == "build") {
          // If creep needs to build target
          let target = Game.getObjectById(creep.memory.targetId)

          if (target == null) {
            // If there is no target
            let constructionSite = source.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
              filter: (structure) => {
                return (structure.pos.inRangeTo(source, 3));
              }
            });

            if (constructionSite == null) {
              creep.memory.harvesterMode = "object";
              creep.memory.targetId = "";
              flag.constructions = room.find(FIND_CONSTRUCTION_SITES);
            }
            // Else get new target
            else if (constructionSite !== null) {
              creep.memory.targetId = constructionSite.id
            }
          }
          // If creep has target

          if (target !== null) {
            if (creep.build(target) === ERR_NOT_IN_RANGE) {
              creep.travelTo(target)
            }
          }
        }
        else if (mode == "source") {
          // If creep has no target
          let target = Game.getObjectById(creep.memory.targetId)


          if (creep.memory.targetId.length == 0) {
            // If there is no target
            let targetId = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
              filter: (s) => (s.structureType === STRUCTURE_SPAWN
              || s.structureType === STRUCTURE_EXTENSION)
              && s.energy < s.energyCapacity
            });
            if (targetId !== null) {
              creep.memory.targetId = targetId.id;
            }
          }





          // If creep has target
          if (target !== null) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.travelTo(target)
            }
            if (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
              creep.memory.targetId = [];
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


    if (creep.room.name == creep.memory.room) {
      flag.harvesterCpu += Game.cpu.getUsed() - start
    }
    if (flag == undefined) {
      console.log(creep.room.name)
    }
  }
};

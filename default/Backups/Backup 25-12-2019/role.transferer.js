module.exports = {
    // a function to run the logic for this role
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
        if (!creep.memory.container2) {
            creep.memory.container2 = {}
        }
        let max = Math.max(creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY), creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))
        if (creep.memory.working === true) {
            let target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType === STRUCTURE_SPAWN
                    || s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_TOWER && s.energy < 500)
                    && s.energy < s.energyCapacity
            });
            let target2 = creep.memory.container2 = creep.pos.findClosestByRange(creep.room.containers) && structure.pos.inRangeTo(creep.room.controller, 10);
            if(target2 !== undefined && creep.room.controller.level <= 5) {
                if (creep.transfer(target2, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(target2)
                }
            }
            else if (target !== undefined) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.travelTo(target)
                }
            }
            else {creep.memory.working = false;}
        }
        else if (creep.memory.working === false) {
            if ((creep.room.terminal !== undefined && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 500) || (creep.room.storage !== undefined && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 500)) {
                if (creep.room.terminal !== undefined && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) == max) {
                    if (creep.withdraw(creep.room.terminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(creep.room.terminal)
                    }
                }
                else if (creep.room.storage !== undefined && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) == max) {
                    if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(creep.room.storage)
                    }
                }
            }
            else if ((creep.room.terminal === undefined && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 500) || (creep.room.storage === undefined && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 500)) {
                if ((creep.room.links.length > 0 && creep.memory.link.structureType !== "link") || Game.time % 250 == 0) {
                    creep.memory.link = creep.pos.findClosestByRange(creep.room.links);
                }
                if ((creep.room.containers.length > 0 && creep.memory.container.structureType !== "container") || Game.time % 250 == 0) {
                    creep.memory.container = creep.pos.findClosestByRange(creep.room.containers) && !structure.pos.inRangeTo(creep.room.controller, 5);
                }

                let link = Game.getObjectById(creep.memory.link.id);
                let container = Game.getObjectById(creep.memory.container.id);
                
                if (creep.room.links.length >= 2) {
                    if (creep.withdraw(link, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(link)
                    }
                }
                else if (creep.room.links.length < 2 && creep.room.containers.length > 0) {
                    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(container)
                    }
                }
                else if (creep.room.links.length < 2 && creep.room.containers.length == 0) {
                    let target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                    if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
                        creep.travelTo(target)
                    }
                }
                else {Game.notify("ERR: This room's Transferer cant Withdraw (" + creep.room.name + ")!")}
            }
        }
    }
};
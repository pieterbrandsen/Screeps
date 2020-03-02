module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if creep is bringing energy to the controller but has no energy left
        if (creep.memory.working === true && creep.carry.mineralAmount !== creep.mineralCapacity) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working === false && creep.carry.mineralAmount === creep.mineralCapacity) {
            // switch state
            creep.memory.working = true;
        }
        /*else if (creep.ticksToLive < 50) {
            // switch state
            creep.memory.working = 1;
        }*/

        // if creep is supposed to transfer energy to the controller
        if (creep.memory.working === true) {
            // try to transfer energy, if it is not in range
            if (creep.transfer(creep.room.terminal, RESOURCE_OXYGEN) === ERR_NOT_IN_RANGE) {
                // move towards it
                creep.travelTo(creep.room.terminal, {reusePath: 50,  visualizePathStyle: {
                        fill: 'transparent',
                        stroke: '#00ff00',
                        lineStyle: 'dashed',
                        strokeWidth: 0.25,
                        opacity: 0.3}})
            }
        }
        else if (creep.memory.working === false) {
            // try to transfer energy, if it is not in range
            if (creep.withdraw(creep.room.storage, RESOURCE_OXYGEN) === ERR_NOT_IN_RANGE) {
                // move towards it
                creep.travelTo(creep.room.storage, {reusePath: 50,  visualizePathStyle: {
                        fill: 'transparent',
                        stroke: '#FF0000',
                        lineStyle: 'dashed',
                        strokeWidth: 0.25,
                        opacity: 0.3}})
            }
        }
    }
};
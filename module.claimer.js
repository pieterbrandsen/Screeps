module.exports = {
  run: function(creep) {
    // Get The Variables Needed For Module //
    const controller = creep.room.controller;


    function claimRoom() {
      // Run Claim Target //
      switch(creep.claimController(controller)) {
        case OK:
        // Remove Claimer Flag Because Room Is Claimed //
        Game.flags["claim"].remove();
        creep.say("Claimed");
        // Build BuilderLD Flag So Room Get's Setup //
        creep.room.createFlag(25,25,"builderLD"+creep.memory.spawnRoom);
        // Suicide Creep Because He Is Not Longer Needed //
        creep.suicide();
        break;
        case ERR_NOT_OWNER:
        break;
        case ERR_BUSY:
        break;
        case ERR_INVALID_TARGET:
        // If Controller Is Already Claimed //
        creep.attackController(controller);
        break;
        case ERR_FULL:
        break;
        case ERR_NOT_IN_RANGE:
        // Travel To Controller //
        creep.travelTo(controller);
        creep.say("Moving");
        break;
        case ERR_NO_BODYPART:
        break;
        case ERR_GCL_NOT_ENOUGH:
        break;
        default:
        break;
      }
    }
  }
};

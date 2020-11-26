//#region Require('./)
import { Config, MemoryApi_All, MemoryApi_Room } from "Utils/importer/internals";
//#endregion

//#region Class
export class TimerHelper_Functions {
  public static getHostileCreeps(room: Room) {
    // Create a acces point to the roomMemory //
    const roomMemory: RoomMemory = Memory.rooms[room.name];

    // Reset the memory for enemies
    roomMemory.enemies = {
      parts: { WORK: 0, ATTACK: 0, RANGED_ATTACK: 0, TOUGH: 0, HEAL: 0 },
      creeps: []
    };

    const allHostileCreeps: Creep[] | any = room.find(FIND_HOSTILE_CREEPS);

    // Loop through each hostile creep found
    for (let i = 0; i < allHostileCreeps.length; i++) {
      const creep: Creep = allHostileCreeps[i];
      // Check if current owner is on whitelist. If so break
      if (Config.whitelist.indexOf(creep.owner.username) >= 0) {
        break;
      }

      // Create variables for creep part counts
      let netToughCount: number = 0;
      let netAttackCount: number = 0;
      let netRangedAttackCount: number = 0;
      let netHealCount: number = 0;

      // Loop though all the parts in the body to check for boost.
      creep.body.forEach(part => {
        // If the part is boosted
        if (part.boost !== undefined) {
          switch (part.boost) {
            case RESOURCE_UTRIUM_HYDRIDE:
              netAttackCount += 2;
              break;
            case RESOURCE_KEANIUM_OXIDE:
              netRangedAttackCount += 2;
              break;
            case RESOURCE_LEMERGIUM_OXIDE:
              netHealCount += 2;
              break;
            // case RESOURCE_GHODIUM_OXIDE:
            // netToughCount+=2;
            // break;
            case RESOURCE_UTRIUM_ACID:
              netAttackCount += 3;
              break;
            case RESOURCE_KEANIUM_ALKALIDE:
              netRangedAttackCount += 3;
              break;
            case RESOURCE_LEMERGIUM_ALKALIDE:
              netHealCount += 3;
              break;
            // case RESOURCE_GHODIUM_ALKALIDE:
            // netToughCount+=3;
            // break;
            case RESOURCE_CATALYZED_UTRIUM_ACID:
              netAttackCount += 4;
              break;
            case RESOURCE_CATALYZED_KEANIUM_ACID:
              netRangedAttackCount += 4;
              break;
            case RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE:
              netHealCount += 4;
              break;
            // case RESOURCE_CATALYZED_GHODIUM_ALKALIDE:
            //   netToughCount += 4;
            //   break;
            default:
              break;
          }
        } else {
          // Else switch between the parts that needs to be saved
          switch (part.type) {
            case "tough":
              netToughCount += 1;
              break;
            case "attack":
              netAttackCount += 1;
              break;
            case "ranged_attack":
              netRangedAttackCount += 1;
              break;
            case "heal":
              netHealCount += 1;
              break;
            default:
              break;
          }
        }
      });

      // Add all found parts to total memory
      roomMemory.enemies.parts.ATTACK += netAttackCount;
      roomMemory.enemies.parts.RANGED_ATTACK += netRangedAttackCount;
      roomMemory.enemies.parts.HEAL += netHealCount;
      roomMemory.enemies.parts.TOUGH += netToughCount;

      // Add creep parts and id to array
      roomMemory.enemies.creeps.push({
        id: creep.id,
        parts: {
          ATTACK: netAttackCount,
          RANGED_ATTACK: netRangedAttackCount,
          TOUGH: netToughCount,
          HEAL: netHealCount
        }
      });
    }
  }

  public static globalRoomStructureNullChecker(room: Room) {
    // Create a acces point to the roomMemory //
    const roomMemory: RoomMemory = Memory.rooms[room.name];

    // Check all structures at input position
    const structureExist = (pos: RoomPos, structureType: string): [boolean, string] => {
      // Get all structure at input position
      const structures = room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y);

      // Loop through all structures
      for (const structure of structures) {
        // Is the structure type the Structure
        if (structure.structureType === structureType) {
          return [true, structure.id];
        }
      }
      return [false, ""];
    };

    // Check all source structures
    for (let i = 0; i < roomMemory.roomPlanner.room.sources.length; i++) {
      // Get source
      const source = roomMemory.roomPlanner.room.sources[i];

      // Break if there is still a live structure
      if (Game.getObjectById(source!.id!) === null) {
        // Get all structures at saved pos
        const structureExistResult = structureExist(source.pos!, source.structureType!);

        // If structure was found
        if (structureExistResult[0]) {
          // Save the id back to memory
          roomMemory.roomPlanner.room.sources[i].id = structureExistResult[1];
        } else {
          // Remove id from memory if its removed
          roomMemory.roomPlanner.room.sources[i].id = undefined;
        }
      }
    }
  }

  public static ownedRoomStructureNullChecker(room: Room) {
    // Create a acces point to the roomMemory //
    const roomMemory: RoomMemory = Memory.rooms[room.name];

    // If the headSpawn is null
    if (Game.getObjectById(roomMemory.commonMemory.headSpawnId!) === null) {
      const spawns = MemoryApi_Room.getStructuresOfType(room, STRUCTURE_SPAWN);
      roomMemory.commonMemory.headSpawnId = room.terminal
        ? room.terminal.pos.findInRange(spawns, 2)[0]
          ? // @ts-ignore: Id DOES exist on the result
            room.terminal.pos.findInRange(room.spawns, 2)[0].id
          : spawns[0].id
        : spawns[0]
        ? spawns[0].id
        : room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_SPAWN
          }).length > 0
        ? room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_SPAWN
          })[0].id
        : undefined;
    }

    // Check all links to see if its still there //
    // Check each source for a link
    if (room.controller!.level >= 5) {
      for (let i = 0; i < roomMemory.commonMemory.sources.length; i++) {
        // Get the source
        const source: Source | null = Game.getObjectById(roomMemory.commonMemory.sources[i].id);

        // If source is not null
        if (source !== null) {
          // Find a link
          const sourceLink = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
            filter: { structureType: STRUCTURE_LINK }
          })[0];

          // If a link is found, set it to the memory
          if (roomMemory.commonMemory.links !== undefined && sourceLink !== undefined) {
            roomMemory.commonMemory.links[`source${i}`] = sourceLink.id;
          }
        }
      }

      // Check if there is a link at the headSpawn
      const headSpawn: StructureSpawn | null = Game.getObjectById(roomMemory.commonMemory.headSpawnId!);
      if (headSpawn !== null) {
        // Find a link
        const spawnLink = headSpawn.pos.findInRange(FIND_MY_STRUCTURES, 2, {
          filter: { structureType: STRUCTURE_LINK }
        })[0];

        // If a link is found, set it to the memory
        if (roomMemory.commonMemory.links !== undefined && spawnLink !== undefined) {
          roomMemory.commonMemory.links["head"] = spawnLink.id;
        }
      }

      // Check if there is a link at the controller
      // Find a link
      const controllerLink = room.controller?.pos.findInRange(FIND_MY_STRUCTURES, 2, {
        filter: { structureType: STRUCTURE_LINK }
      })[0];

      // If a link is found, set it to the memory
      if (roomMemory.commonMemory.links !== undefined && controllerLink !== undefined) {
        roomMemory.commonMemory.links["controller"] = controllerLink.id;
      }
    }

    // Set amount of mineral to the roomMemory
    // @ts-ignore
    roomMemory.commonMemory.mineral.amount = room.find(FIND_MINERALS)[0]
      ? Math.round(room.find(FIND_MINERALS)[0].mineralAmount)
      : undefined;
  }
}
//#endregion

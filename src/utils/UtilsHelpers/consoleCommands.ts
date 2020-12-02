export class ConsoleCommands {
  public static init(): void {
    global.addRemoteRoom = this.addRemoteRoom; // eslint-disable-line @typescript-eslint/unbound-method
    global.addScoreContainerRoom = this.addScoreContainerRoom; // eslint-disable-line @typescript-eslint/unbound-method
    global.help = this.help; // eslint-disable-line @typescript-eslint/unbound-method
  }

  public static addRemoteRoom(spawnRoom: string | undefined, remoteRoom: string | undefined): void {
    if (!spawnRoom) {
      console.log('SpawnRoom is not inputted, please try again');
      return;
    }
    if (!remoteRoom) {
      console.log('RemoteRoom is not inputted, please try again');
      return;
    }

    try {
      const spawnRoomMemory: RoomMemory = Memory.rooms[spawnRoom];
      spawnRoomMemory.remoteRooms?.push(remoteRoom);
    } catch (err) {
      console.log('There went something wrong adding the RemoteRoom to the SpawnRoom');
      return;
    }

    console.log('RemoteRoom added successfully to spawnRoom');
  }

  public static addScoreContainerRoom(spawnRoom: string | undefined, targetRoom: string | undefined): void {
    if (Game.shard.name !== 'shardSeason') {
      console.log('This shard is not on seasonal, please try again');
      return;
    }

    if (!spawnRoom) {
      console.log('SpawnRoom is not inputted, please try again');
      return;
    }
    if (!targetRoom) {
      console.log('TargetRoom is not inputted, please try again');
      return;
    }

    try {
      const spawnRoomMemory: RoomMemory = Memory.rooms[spawnRoom];
      spawnRoomMemory.scoreContainerRooms?.push(targetRoom);
    } catch (err) {
      console.log('There went something wrong adding the TargetRoom to the SpawnRoom');
      return;
    }

    console.log('TargetRoom added successfully to spawnRoom');
  }

  public static help(): void {
    console.log('All commands:');
    console.log('------------------------------------------------');
    console.log('global.addRemoteRoom(spawnRoom: string, remoteRoom: string)');
    console.log('This command will add a roomName to the spawnRoom remotes list.');
    console.log('global.addScoreContainerRoom(spawnRoom: string, targetRoom: string)');
    console.log('This command will add a roomName to the spawnRoom scoreContainerRooms list.');
    console.log('End of command list');
  }
}

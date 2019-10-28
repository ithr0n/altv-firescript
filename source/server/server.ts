import alt from 'alt';

alt.onClient('spawnVehicle', (player: alt.Player, vehicle: string) => {
    new alt.Vehicle(vehicle, player.pos.x + 5, player.pos.y, player.pos.z, 0, 0, 0);
})
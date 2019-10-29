import alt from 'alt';

import './FireScript'

alt.onClient('spawnVehicle', (player: alt.Player, vehicle: string) => {
    new alt.Vehicle(vehicle, player.pos.x + 5, player.pos.y, player.pos.z, 0, 0, 0);
})

alt.onClient('setModel', (player: alt.Player, modelHash: number) => {
    player.model = modelHash
})

alt.onClient('giveWeaponToPlayer', (player: alt.Player, weaponHash: number) => {
    player.giveWeapon(weaponHash, 1000, true);
})
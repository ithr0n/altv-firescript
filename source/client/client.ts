/// <reference path="./typings/altv-client.d.ts" />

import alt from 'alt';
import game from 'natives';

import './FireScript'

alt.on('consoleCommand', (...args: string[]) => {
    alt.log('Command: ' + args.join(' '))

    switch (args[0]) {
        case 'startfire':
            alt.emit('FireScript:Client:StartFireAtPlayer', alt.Player.local, parseInt(args[1]), parseInt(args[2]), getBoolean(args[3]))
            break
        case 'stopfire':
            alt.emit('FireScript:Client:StopFiresAtPlayer')
            break
        case 'stopallfires':
            alt.emit('FireScript:Client:StopAllFires')
            break
        case 'startsmoke':
            alt.emit('FireScript:Client:StartSmokeAtPlayer', alt.Player.local, parseInt(args[1]))
            break
        case 'stopsmoke':
            alt.emit('FireScript:Client:StopSmokesAtPlayer', alt.Player.local)
            break
        case 'stopallsmoke':
            alt.emit('FireScript:Client:StopAllSmoke', alt.Player.local)
            break


        case 'gps':
            alt.log(`${alt.Player.local.pos.x} ${alt.Player.local.pos.y} ${alt.Player.local.pos.z} `)
            break
        case 'veh':
            alt.emitServer("spawnVehicle", args[1])
            break
    }
})



// helper
function getBoolean(value: string | number | boolean): boolean {
    switch (value) {
        case true:
        case "true":
        case 1:
        case "1":
        case "on":
        case "yes":
            return true;
        default:
            return false;
    }
}









/// <reference path="./typings/altv-client.d.ts" />

import alt from 'alt';
import game, { playerAttachVirtualBound } from 'natives';

import './FireScript'

alt.on('consoleCommand', (...args: string[]) => {
    alt.log('Command: ' + args.join(' '))

    switch (args[0]) {
        case 'startfire':
            let createTimeout = 10000
            if (args.length >= 5) createTimeout = parseInt(args[4])
            alt.emitServer('FireScript:Server:StartFireAtPlayer', parseInt(args[1]), parseInt(args[2]), getBoolean(args[3]), createTimeout)
            break
        case 'stopfire':
            alt.emitServer('FireScript:Server:StopFiresAtPlayer')
            break
        case 'stopallfires':
            alt.emitServer('FireScript:Server:StopAllFires')
            break
        case 'startsmoke':
            alt.emitServer('FireScript:Server:StartSmokeAtPlayer', parseInt(args[1]))
            break
        case 'stopsmoke':
            alt.emitServer('FireScript:Server:StopSmokesAtPlayer')
            break
        case 'stopallsmokes':
            alt.emitServer('FireScript:Server:StopAllSmokes')
            break


        case 'gps':
            alt.log(`${alt.Player.local.pos.x} ${alt.Player.local.pos.y} ${alt.Player.local.pos.z} `)
            break
        case 'veh':
            alt.emitServer("spawnVehicle", args[1])
            break
        case 'setmdl':
            alt.emitServer("setModel", game.getHashKey(args[1]))
            break
        case 'gib':
            alt.emitServer("giveWeaponToPlayer", game.getHashKey(args[1]))
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









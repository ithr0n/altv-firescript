/// <reference path="./typings/altv-client.d.ts" />

import alt from 'alt'

import './FireScript'

alt.on('consoleCommand', (...args: string[]) => {
    alt.log('Command: ' + args.join(' '))

    if (args[0] !== 'fire') return
    if (args.length <= 1 || (args.length >= 2 && args[1] === 'help')) {
        alt.log('Usages: fire (subcommand) (options)')
        alt.log('Examples:')
        alt.log('  fire start (flames) (range) (flags) [(delay)]')
        alt.log('  fire stop [all]')
        alt.log('  fire smoke start')
        alt.log('  fire smoke stop [all]')
        return
    }

    switch (args[1]) {
        case 'start':
            if (args.length < 5) return
            let createTimeout = 10
            if (args.length > 5) createTimeout = parseInt(args[5])
            alt.emitServer('FireScript:Server:InitializeFire', parseInt(args[2]), parseInt(args[3]), parseInt(args[4]), createTimeout)
            break

        case 'stop':
            const all = (args.length > 2 && args[2] === 'all')
            alt.emitServer('FireScript:Server:StopFire', !all, alt.Player.local.pos)
            break
    }
})

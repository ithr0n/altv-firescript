import alt from 'alt'
import Fire, { FireEvolveFlags } from './Fire'
import Smoke from './Smoke'
import Helper from './Helper'

// events
alt.on('playerConnect', (player: alt.Player) => {
    ActiveFires.forEach((fire) => {
        if (fire != null) {
            //fire.start()
            alt.emitClient(player, 'FireScript:Client:StartLocalFire', fire.Id, fire.Position, fire.MaxSpreadDistance, fire.EvolveFlags)
        }
    })

    SmokesWithoutFire.forEach((smoke) => {
        smoke.start()
    })
})

alt.on('FireScript:Server:StartFireAtPlayer', (source: alt.Player, maxFlames: number, maxRange: number, evolveFlags: FireEvolveFlags, createTimeout: number) => {
    startFire(source, maxFlames, maxRange, evolveFlags, createTimeout)
})

// fires
const ManageFireTimeout = 50
const ActiveFires: Map<string, Fire> = new Map<string, Fire>()

let timekeeper = Date.now()

setInterval(() => {
    if ((Date.now() - timekeeper) > ManageFireTimeout) {
        timekeeper = Date.now()

        ActiveFires.forEach((value, key, map) => {
            if (value != null && value.Initialized) {
                if (value.Extinguished) {
                    map.delete(key)
                } else if (value.Active) {
                    value.manage()
                }
            }
        })
    }
}, 10)

alt.onClient('FireScript:Server:InitializeFire', (source: alt.Player, maxFlames: number, maxRange: number, evolveFlags: FireEvolveFlags, createTimeout: number) => {
    startFire(source, maxFlames, maxRange, evolveFlags, createTimeout)
})

alt.onClient('FireScript:Server:StopFire', (source: alt.Player, onlyNearbyFires: boolean, position: alt.Vector3, distance: number) => {
    stopFires(onlyNearbyFires, source.pos, distance)
})

function startFire(source: alt.Player, maxFlames: number, maxRange: number, evolveFlags: FireEvolveFlags, createTimeout: number) {
    const firePos = source.pos
    firePos.z -= 0.87
    if (maxFlames > 100) maxFlames = 100
    if (maxFlames < 20) maxFlames = 20
    if (maxRange > 30) maxRange = 30
    if (maxRange < 4) maxRange = 4
    const newId = Helper.generateId()
    ActiveFires.set(newId, new Fire(newId, firePos, maxFlames, maxRange, evolveFlags, source))

    setTimeout(() => {
        const fire = ActiveFires.get(newId)

        if (fire) {
            fire.start()
        }
    }, createTimeout * 1000)
}

function stopFires(onlyNearbyFires: boolean, position: alt.Vector3, distance: number = 35) {
    ActiveFires.forEach((value, key, map) => {
        if (!onlyNearbyFires || Helper.dist(value.Position, position) < distance) {
            value.remove()
            map.delete(key)
        }
    })
}

alt.onClient('FireScript:Server:FireInitialized', (source: alt.Player, fireId: string, flamePositions: [string, alt.Vector3][]) => {
    const fire = ActiveFires.get(fireId)

    if (fire) {
        flamePositions.forEach((item) => {
            fire.initializeFlame(item[0], item[1])
        })

        fire.setInitialized()
    }
})

alt.onClient('FireScript:Server:FlameExtinguished', (source: alt.Player, fireId: string, flameId: string) => {
    const fire = ActiveFires.get(fireId)

    if (fire) {
        fire.removeFlame(flameId)
        alt.emitClient(null, 'FireScript:Client:RemoveLocalFlame', flameId)
    }
})



// smokes
const SmokesWithoutFire: Smoke[] = []

async function startSmoke(source: alt.Player, scale: number) {
    const smoke = new Smoke(source.pos, scale)
    SmokesWithoutFire.push(smoke)
}

function stopSmoke(allSmokes: boolean, position: alt.Vector3) {
    // walk through array in reverse for safe deletion
    for (let i = SmokesWithoutFire.length - 1; i >= 0; --i) {
        if (allSmokes || Helper.dist(SmokesWithoutFire[i].Position, position) < 30) {
            alt.emitClient(null, 'FireScript:Client:StopSmoke', SmokesWithoutFire[i].Id)
            SmokesWithoutFire.splice(i, 1)
        }
    }
}

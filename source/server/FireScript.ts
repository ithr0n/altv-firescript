import alt, { Vector3 } from 'alt'
import Fire from './Fire'
import Smoke from './Smoke'

// events
alt.on('playerConnect', (player: alt.Player) => {
    ActiveFires.forEach((fire) => {
        if (fire != null) {
            fire.start()
        }
    })

    SmokesWithoutFire.forEach((smoke) => {
        smoke.start()
    })
})



// fires
alt.onClient('FireScript:Server:StartFireAtPlayer', (source: alt.Player, maxFlames: number, maxRange: number, explosion: boolean, createTimeout: number) => {
    startFire(source, maxFlames, maxRange, explosion, createTimeout)
})

alt.onClient('FireScript:Server:StopFiresAtPlayer', (source: alt.Player) => {
    stopFires(true, source.pos)
})

alt.onClient('FireScript:Server:StopAllFires', () => {
    stopFires(false, new alt.Vector3(0, 0, 0))
})

alt.onClient('FireScript:Server:RemoveFlame', (source: alt.Player, fireId: string, flameId: string) => {
    const fire = ActiveFires.get(fireId)

    if (fire) {
        fire.removeFlame(flameId)
    }

    alt.emitClient(null, 'FireScript:Client:RemoveLocalFlame', flameId)
})

const ManageFireTimeout = 50
const ActiveFires: Map<string, Fire> = new Map<string, Fire>()

let timekeeper = Date.now()

setInterval(() => {
    if ((Date.now() - timekeeper) > ManageFireTimeout) {
        timekeeper = Date.now()

        ActiveFires.forEach((value, key, map) => {
            if (value != null && value.Initialized) {
                if (value.Active) {
                    value.manage()
                } else  {
                    map.delete(key)
                }
            }
        })
    }
}, 10)


function startFire(source: alt.Player, maxFlames: number, maxRange: number, explosion: boolean, createTimeout: number) {
    const firePos = source.pos
    firePos.z -= 0.87
    if (maxFlames > 100) maxFlames = 100
    if (maxRange > 30) maxRange = 30
    const newId = generateId()
    ActiveFires.set(newId, new Fire(newId, firePos, maxFlames, maxRange, explosion))

    setTimeout(() => {
        const fire = ActiveFires.get(newId)

        if (fire) {
            fire.start()
        }
    }, createTimeout)
}

function stopFires(onlyNearbyFires: boolean, position: alt.Vector3, distance: number = 35) {
    ActiveFires.forEach((value, key, map) => {
        if (!onlyNearbyFires || distanceBetween(value.Position, position) < distance) {
            value.remove()
            map.delete(key)
        }
    })
}

// smokes
alt.onClient('FireScript:Server:StartSmokeAtPlayer', (source: alt.Player, scale: number) => {
    //alt.log('FireScript:Server:StartSmokeAtPlayer')
    startSmoke(source, scale)
})

alt.onClient('FireScript:Server:StopSmokesAtPlayer', (source: alt.Player) => {
    stopSmoke(false, source.pos)
})

alt.onClient('FireScript:Server:StopAllSmokes', (source: alt.Player) => {
    stopSmoke(true, new Vector3(0, 0, 0))
})

const SmokesWithoutFire: Smoke[] = []

async function startSmoke(source: alt.Player, scale: number) {
    const smoke = new Smoke(source.pos, scale)
    SmokesWithoutFire.push(smoke)
}

function stopSmoke(allSmokes: boolean, position: alt.Vector3) {
    // walk through array in reverse for safe deletion
    for (let i = SmokesWithoutFire.length - 1; i >= 0; --i) {
        if (allSmokes || distanceBetween(SmokesWithoutFire[i].Position, position) < 30) {
            alt.emitClient(null, 'FireScript:Client:StopSmoke', SmokesWithoutFire[i].Id)
            SmokesWithoutFire.splice(i, 1)
        }
    }
}


// helper
function distanceBetween(distOne: alt.Vector3, distTwo: alt.Vector3) {
    let distSqr = Math.pow(distOne.x - distTwo.x, 2) + Math.pow(distOne.y - distTwo.y, 2) + Math.pow(distOne.z - distTwo.z, 2);
    return distSqr;
}

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9)
}
import alt from 'alt'
import Fire from './Fire'

// events
alt.on('playerConnect', (player: alt.Player) => {
    ActiveFires.forEach((fire) => {
        if (fire != null) {
            fire.start()
        }
    })
})


alt.onClient('FireScript:Server:StartFireAtPlayer', (source: alt.Player, maxFlames: number, maxRange: number, explosion: boolean) => {
    startFire(source, maxFlames, maxRange, explosion)
})

alt.onClient('FireScript:Server:StopFiresAtPlayer', (source: alt.Player) => {
    stopFires(true, source.pos)
})

alt.onClient('FireScript:Server:StopAllFires', () => {
    stopFires(false, new alt.Vector3(0, 0, 0))
})

alt.onClient('FireScript:Server:RemoveFlame', (source: alt.Player, flameId: number) => {
    alt.emitClient(null, 'FireScript:Client:RemoveLocalFlame', flameId)
})


const ManageFireTimeout = 50
const ActiveFires: (Fire | null)[] = []
const SmokesWithoutFire: [number, alt.Vector3][] = []

let timekeeper = Date.now()

setInterval(() => {
    if ((Date.now() - timekeeper) > ManageFireTimeout) {
        timekeeper = Date.now()

        ActiveFires.forEach((fire, index, array) => {
            if (fire != null) {
                if (fire.Active) {
                    fire.manage()
                } else {
                    array.splice(index, 1)
                }
            }
        })
    }
}, 10)


function startFire(source: alt.Player, maxFlames: number, maxRange: number, explosion: boolean) {
    const firePos = source.pos
    firePos.z -= 0.87
    if (maxFlames > 100) maxFlames = 100
    if (maxRange > 30) maxRange = 30
    const newIdx = ActiveFires.push(null)
    const fire = new Fire(newIdx, firePos, maxFlames, maxRange, explosion)

    setTimeout(() => {
        fire.start()
        ActiveFires.splice(newIdx, 1, fire)
    }, 1500)
}

function stopFires(onlyNearbyFires: boolean, position: alt.Vector3, distance: number = 35) {
    ActiveFires.forEach((item, index, array) => {
        if (item) {
            if (!onlyNearbyFires || distanceBetween(item.Position, position) < distance) {
                item.remove()
                array.splice(index, 1)
            }
        }
    })
}
/*
async function startSmoke(source: alt.Player, scale: number) {
    const position = source.pos
    await requestNamedPtfxAssetPromise("scr_agencyheistb")
    SmokesWithoutFire.push(
        [
            game.startParticleFxNonLoopedAtCoord("scr_env_agency3b_smoke", position.x, position.y, position.z, 0, 0, 0, scale, false, false, false),
            position
        ]
    )
}

function stopSmoke(allSmoke: boolean, position: alt.Vector3) {
    SmokesWithoutFire.forEach((item, index, array) => {
        if (!allSmoke || distanceBetween(item[1], position) < 30) {
            game.stopParticleFxLooped(item[0], false)
            array.splice(index, 1)
        }
    })
}*/


// helper
function distanceBetween(distOne: alt.Vector3, distTwo: alt.Vector3) {
    let distSqr = Math.pow(distOne.x - distTwo.x, 2) + Math.pow(distOne.y - distTwo.y, 2) + Math.pow(distOne.z - distTwo.z, 2);
    return distSqr;
}
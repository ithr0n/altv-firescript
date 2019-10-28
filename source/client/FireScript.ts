import alt from 'alt';
import game from 'natives';
import Fire from './Fire';

const ManageFireTimeout = 50
const ActiveFires: Fire[] = []
const SmokesWithoutFire: [number, alt.Vector3][] = []

let timekeeper = Date.now()

alt.setInterval(() => {
    if ((Date.now() - timekeeper) > ManageFireTimeout) {
        timekeeper = Date.now()

        ActiveFires.forEach((fire, index, array) => {
            if (fire.Initialized) {
                if (fire.Active) {
                    fire.manage()
                } else {
                    array.splice(index, 1)
                }
            }
        })
    }
}, 10)


alt.on('FireScript:Client:StartFireAtPlayer', (source: alt.Player, maxFlames: number, maxRange: number, explosion: boolean) => {
    startFire(source, maxFlames, maxRange, explosion)
})

alt.on('FireScript:Client:StopFiresAtPlayer', () => {
    stopFires(true, alt.Player.local.pos)
})

alt.on('FireScript:Client:StopAllFires', () => {
    stopFires(false, new alt.Vector3(0, 0, 0))
})

alt.on('FireScript:Client:StopFireAtPosition', (x: number, y: number, z: number) => {
    stopFires(true, new alt.Vector3(x, y, z), 3)
})

alt.on('FireScript:Client:StartSmokesAtPlayer', (source: alt.Player, scale: number) => {
    startSmoke(source, scale)
})

alt.on('FireScript:Client:StopSmoke', () => {
    stopSmoke(true, alt.Player.local.pos)
})

alt.on('FireScript:Client:StopAllSmoke', () => {
    stopSmoke(false, new alt.Vector3(0, 0, 0))
})


function startFire(source: alt.Player, maxFlames: number, maxRange: number, explosion: boolean) {
    const firePos = source.pos
    firePos.z -= 0.87
    if (maxFlames > 100) maxFlames = 100
    if (maxRange > 30) maxRange = 30
    const fire = new Fire(firePos, maxFlames, maxRange, explosion)

    fire.start().then(() => {
        ActiveFires.push(fire)
    })
}

function stopFires(onlyNearbyFires: boolean, position: alt.Vector3, distance: number = 35) {
    ActiveFires.forEach((item, index, array) => {
        if (!onlyNearbyFires || distanceBetween(item.Position, position) < distance) {
            item.remove(false)
            array.splice(index, 1)
        }
    })
}

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
}





// helper
function requestNamedPtfxAssetPromise(assetName: string) {
    return new Promise((resolve, reject) => {
        /*if (!game.doesAnimDictExist(assetName))
            return resolve(false);*/

        if (game.hasNamedPtfxAssetLoaded(assetName)) {
            return resolve(true);
        }

        game.requestNamedPtfxAsset(assetName);

        let inter = alt.setInterval(() => {
            if (game.hasNamedPtfxAssetLoaded(assetName)) {
                alt.clearInterval(inter);
                alt.log('Asset loaded: ' + assetName);
                return resolve(true);
            }
            //alt.log('Requesting asset: ' + assetName);
        }, 10);
    });
}

function distanceBetween(distOne: alt.Vector3, distTwo: alt.Vector3) {
    let distSqr = Math.pow(distOne.x - distTwo.x, 2) + Math.pow(distOne.y - distTwo.y, 2) + Math.pow(distOne.z - distTwo.z, 2);
    return distSqr;
}
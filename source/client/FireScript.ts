import alt from 'alt'
import game from 'natives'
import LocalFire from './LocalFire'
import LocalFlame from './LocalFlame'

// old
/*
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
})*/




// new
const fires: Map<string, LocalFire> = new Map<string, LocalFire>()

alt.onServer('FireScript:Client:StartLocalFire', (fireId: string, position: alt.Vector3, maxSpreadDistance: number, explosion: boolean) => {
    const fire = new LocalFire(fireId, position, maxSpreadDistance, explosion)
    fire.start()

    fires.set(fireId, fire)
})

alt.onServer('FireScript:Client:RemoveFire', (fireId: string) => {
    const fire = fires.get(fireId)

    if (fire) {
        fire.remove()
    }
})


alt.onServer('FireScript:Client:StartLocalFlame', (fireId: string, flameId: string, position: alt.Vector3) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.addFlame(new LocalFlame(fireId, flameId, position))
    }
})

alt.onServer('FireScript:Client:RemoveLocalFlame', (fireId: string, flameId: string) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.removeFlame(flameId)
    }
})

alt.onServer('FireScript:Client:ManageFlame', (fireId: string, flameId: string, isFlameActive: boolean) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.manageFlame(flameId, isFlameActive)
    }
})


const smokes: Map<string, number> = new Map<string, number>()

alt.onServer('FireScript:Client:StartSmoke', (smokeId: string, position: alt.Vector3, scale: number) => {
    //alt.log('FireScript:Client:StartSmoke')
    requestNamedPtfxAssetPromise("scr_agencyheistb").then(() => {
        game.useParticleFxAsset("scr_agencyheistb")
        smokes.set(smokeId, game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", position.x, position.y, position.z, 0, 0, 0, scale, false, false, false, false))
    })
})

alt.onServer('FireScript:Client:StopSmoke', async (smokeId: string) => {
    //alt.log('stop ' + smokeId)
    const smokePtfx = smokes.get(smokeId)

    if (smokePtfx) {
        game.stopParticleFxLooped(smokePtfx, false)
        smokes.delete(smokeId)
        //alt.log('done')
    }
})


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

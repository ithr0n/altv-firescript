import alt from 'alt'
import game from 'natives'
import LocalFire from './LocalFire'
import LocalFlame from './LocalFlame'
import LocalHelper from './LocalHelper';

alt.onServer('FireScript:Client:ShowHelp', () => {
    alt.log('Usages: fire (subcommand) (options)')
    alt.log('Examples:')
    alt.log('  fire start (flames) (range) (flags) [(delay)]')
    alt.log('  fire stop [all]')
    alt.log('  fire smoke start')
    alt.log('  fire smoke stop [all]')
})

// fires
const fires: Map<string, LocalFire> = new Map<string, LocalFire>()

alt.onServer('FireScript:Client:InitializeFire', (fireId: string, position: alt.Vector3, maxSpreadDistance: number, evolveFlags: number, maxFlames: number) => {
    const fire = new LocalFire(fireId, position, maxSpreadDistance, evolveFlags)
    fires.set(fireId, fire)
    fire.init(maxFlames)
})

alt.onServer('FireScript:Client:StartLocalFire', (fireId: string, position: alt.Vector3, maxSpreadDistance: number, evolveFlags: number) => {
    let fire = fires.get(fireId)
    if (!fire) {
        // at this point only the creator of the fire has the object
        fire = new LocalFire(fireId, position, maxSpreadDistance, evolveFlags)
        fires.set(fireId, fire)
    }
    fire.start()
})

alt.onServer('FireScript:Client:RemoveLocalFire', (fireId: string) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.remove()
    }
})

alt.onServer('FireScript:Client:SpawnLocalFlame', (fireId: string, flameId: string, position: alt.Vector3, isGasFire: boolean) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.addFlame(new LocalFlame(fireId, flameId, position, isGasFire))
    }
})

alt.onServer('FireScript:Client:RemoveLocalFlame', (fireId: string, flameId: string) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.removeFlame(flameId)
    }
})

alt.onServer('FireScript:Client:ManageFlame', (fireId: string, flameId: string) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.manageFlame(flameId)
    }
})

// smokes
const smokes: Map<string, number> = new Map<string, number>()

alt.onServer('FireScript:Client:StartSmoke', (smokeId: string, position: alt.Vector3, scale: number) => {
    //alt.log('FireScript:Client:StartSmoke')
    LocalHelper.requestNamedPtfxAssetPromise("scr_agencyheistb").then(() => {
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

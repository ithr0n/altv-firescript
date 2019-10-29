import alt from 'alt'
import game from 'natives'
import LocalFlame from './LocalFlame'

export default class LocalFire {
    private static readonly Range = 10000

    private smokePtfx: number | null = null
    private interiorSmokePtfx: number | null = null
    private flames: Map<string, LocalFlame> = new Map<string, LocalFlame>()
    private bigSmokeSpawned: boolean = false

    constructor(
        public readonly Id: string,
        public readonly Position: alt.Vector3,
        public readonly MaxSpreadDistance: number,
        public readonly EvolveFlags: number
    ) { }

    public async start() {
        await requestNamedPtfxAssetPromise("scr_agencyheistb")
        game.useParticleFxAsset("scr_agencyheistb")
        this.smokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.Position.x, this.Position.y, this.Position.z, 0, 0, 0, 0.3, false, false, false, false)

        if (!(this.EvolveFlags & (1 << 1))) { // only spawn smoke in beginning
            await this.spawnBigSmoke()
        }

        if (this.EvolveFlags & (1 << 0)) { // start with explosion
            if (distanceBetween(alt.Player.local.pos, this.Position) <= LocalFire.Range) {
                game.shakeGameplayCam("MEDIUM_EXPLOSION_SHAKE", 1)
                await requestNamedPtfxAssetPromise("scr_trevor3")
                const explosionPos = this.Position
                explosionPos.z += 1
                game.startParticleFxNonLoopedAtCoord("scr_trev3_trailer_expolsion", explosionPos.x, explosionPos.y, explosionPos.z, 0, 0, 0, 1, false, false, false)
                game.playSoundFromCoord(-1, "MAIN_EXPLOSION_CHEAP", this.Position.x, this.Position.y, this.Position.z, '', false, LocalFire.Range, false)
            }
        }
    }

    public remove() {
        //alt.log('local fire remove')
        if (this.smokePtfx != null) game.stopParticleFxLooped(this.smokePtfx, false)
        if (this.interiorSmokePtfx != null) game.stopParticleFxLooped(this.interiorSmokePtfx, false)
    }

    private async spawnBigSmoke() {
        if (this.bigSmokeSpawned) return
        this.bigSmokeSpawned = true

        await requestNamedPtfxAssetPromise("scr_agencyheistb")
        game.useParticleFxAsset("scr_agencyheistb")
        this.smokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.Position.x, this.Position.y, this.Position.z, 0, 0, 0, this.MaxSpreadDistance * 0.5, false, false, false, false)

        if (game.getInteriorAtCoords(this.Position.x, this.Position.y, this.Position.z) == 0) {
            // additional bigger smoke when not in house
            game.useParticleFxAsset("scr_agencyheistb")
            this.interiorSmokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.Position.x, this.Position.y, this.Position.z, 0, 0, 0, 5, false, false, false, false)
        }
    }

    public addFlame(flame: LocalFlame) {
        this.flames.set(flame.FlameId, flame)
        this.spawnBigSmoke()
    }

    public removeFlame(flameId: string) {
        const flame = this.flames.get(flameId)
        if (flame) {
            flame.remove()
            this.flames.delete(flameId)
        }
    }

    public manageFlame(flameId: string, isFlameActive: boolean) {
        const flame = this.flames.get(flameId)
        if (flame) {
            flame.manage(isFlameActive)
        }
    }
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
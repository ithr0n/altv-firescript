import alt from 'alt'
import game from 'natives'
import LocalFlame from './LocalFlame'

export default class LocalFire {
    private smokePtfx: number | null = null
    private interiorSmokePtfx: number | null = null
    private flames: Map<string, LocalFlame> = new Map<string, LocalFlame>()

    constructor(
        public readonly Id: string,
        public readonly Position: alt.Vector3,
        public readonly MaxSpreadDistance: number,
        public readonly StartWithExplosion: boolean
    ) { }

    public async start() {
        await requestNamedPtfxAssetPromise("scr_agencyheistb")
        game.useParticleFxAsset("scr_agencyheistb")
        this.smokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.Position.x, this.Position.y, this.Position.z, 0, 0, 0, this.MaxSpreadDistance * 0.5, false, false, false, false)

        if (this.StartWithExplosion) {
            game.shakeGameplayCam("MEDIUM_EXPLOSION_SHAKE", 1)
            await requestNamedPtfxAssetPromise("scr_trevor3")
            const explosionPos = this.Position
            explosionPos.z += 1
            game.startParticleFxNonLoopedAtCoord("scr_trev3_trailer_expolsion", explosionPos.x, explosionPos.y, explosionPos.z, 0, 0, 0, 1, false, false, false)

            // todo: play sound
        }
        if (game.getInteriorAtCoords(this.Position.x, this.Position.y, this.Position.z) == 0) {
            // then we are not in house
            game.useParticleFxAsset("scr_agencyheistb")
            this.interiorSmokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.Position.x, this.Position.y, this.Position.z, 0, 0, 0, 5, false, false, false, false)
        }
    }

    public remove() {
        //alt.log('local fire remove')
        if (this.smokePtfx != null) game.stopParticleFxLooped(this.smokePtfx, false)
        if (this.interiorSmokePtfx != null) game.stopParticleFxLooped(this.interiorSmokePtfx, false)
    }

    public addFlame(flame: LocalFlame) {
        this.flames.set(flame.FlameId, flame)
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

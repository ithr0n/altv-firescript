import alt from 'alt';
import game from 'natives';

export default class Flame {
    constructor(private position: alt.Vector3) {
        this.start()
    }

    private _active: boolean = false
    get Active(): boolean {
        return this._active
    }

    private _initialized: boolean = false
    private flameId: number | null = null
    private flamePtfx: number | null = null

    public start() {
        this._active = true
        this.flameId = game.startScriptFire(this.position.x, this.position.y, this.position.z, 25, false)

        requestNamedPtfxAssetPromise("scr_trevor3").then(() => {
            const smokePos = this.position
            smokePos.z += 0.4
            game.useParticleFxAsset("scr_trevor3")
            this.flamePtfx = game.startParticleFxLoopedAtCoord("scr_trev3_trailer_plume", smokePos.x, smokePos.y, smokePos.z, 0, 0, 0, 0.7, false, false, false, false)

            this._initialized = true
        })
    }

    public remove() {
        //alt.log('flame remove')
        if (this.flameId != null) game.removeScriptFire(this.flameId)
        //game.stopFireInRange(this.position.x, this.position.y, this.position.z, 20)
        if (this.flamePtfx != null) game.stopParticleFxLooped(this.flamePtfx, false)
        this._active = false
    }

    public manage() {
        if (!this._initialized) return
        if (this.flamePtfx != null && game.doesParticleFxLoopedExist(this.flamePtfx)) {
            const numberInRange = game.getNumberOfFiresInRange(this.position.x, this.position.y, this.position.z, 2)
            if (numberInRange < 1) {
                //alt.log('flame manage->remove 1')
                this.remove()
            }
        } else if (this.flamePtfx != null && this.Active) {
            //alt.log('flame manage->remove 2')
            this.remove()
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
import alt from 'alt';
import game from 'natives';

export default class LocalFire {
    private scriptFireId: number | null = null
    private flamePtfx: number | null = null

    public get FlameId() : number {
        return this.id
    }

    constructor(
        private readonly id: number,
        private readonly position: alt.Vector3
    ) {
        this.start()
    }

    start() {
        this.scriptFireId = game.startScriptFire(this.position.x, this.position.y, this.position.z, 25, false)

        requestNamedPtfxAssetPromise("scr_trevor3").then(() => {
            const smokePos = this.position
            smokePos.z += 0.4
            game.useParticleFxAsset("scr_trevor3")
            this.flamePtfx = game.startParticleFxLoopedAtCoord("scr_trev3_trailer_plume", smokePos.x, smokePos.y, smokePos.z, 0, 0, 0, 0.7, false, false, false, false)
        })
    }

    remove() {
        //alt.log('local flame remove')
        if (this.scriptFireId != null) game.removeScriptFire(this.scriptFireId)
        //game.stopFireInRange(this.position.x, this.position.y, this.position.z, 20)
        if (this.flamePtfx != null) game.stopParticleFxLooped(this.flamePtfx, false)
    }

    manage(isFlameActive: boolean) {
        if (this.flamePtfx != null && game.doesParticleFxLoopedExist(this.flamePtfx)) {
            const numberInRange = game.getNumberOfFiresInRange(this.position.x, this.position.y, this.position.z, 2)
            if (numberInRange < 1) {
                //alt.log('local flame manage->remove 1')
                //this.remove()
                alt.emitServer('FireScript:Server:RemoveFlame', this.id)
            }
        } else if (this.flamePtfx != null && isFlameActive) {
            //alt.log('local flame manage->remove 2')
            //this.remove()
            alt.emitServer('FireScript:Server:RemoveFlame', this.id)
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
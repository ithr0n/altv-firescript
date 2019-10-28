import alt from 'alt';
import game from 'natives';
import Flame from './Flame';

export default class Fire {
    constructor(
        private position: alt.Vector3,
        private maxFlames: number = 20,
        private maxSpreadDistance: number = 15,
        private explosion: boolean = false) {
    }

    private _active: boolean = false
    get Active(): boolean {
        return this._active
    }

    get Position(): alt.Vector3 {
        return this.position
    }

    private _initialized: boolean = false
    get Initialized(): boolean {
        return this._initialized
    }

    private flames: Flame[] = []
    private smokePtfx: number | null = null
    private interiorSmokePtfx: number | null = null

    public async start() {
        this._active = true
        for (let i = 0; i < this.maxFlames; i++) {
            //const direction = normalizeVector(new alt.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0))
            const direction = new alt.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0)
            const around = vecAdd(this.position, vecMultiplyScalar(direction, this.maxSpreadDistance))
            this.flames.push(new Flame(around))
            //alt.log(`${around.x} ${around.y} ${around.z} `)
        }

        await requestNamedPtfxAssetPromise("scr_agencyheistb")
        game.useParticleFxAsset("scr_agencyheistb")
        this.smokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.position.x, this.position.y, this.position.z, 0, 0, 0, this.maxSpreadDistance * 0.5, false, false, false, false)

        if (this.explosion) {
            game.shakeGameplayCam("MEDIUM_EXPLOSION_SHAKE", 1)
            await requestNamedPtfxAssetPromise("scr_trevor3")
            const explosionPos = this.position
            explosionPos.z += 1
            game.startParticleFxNonLoopedAtCoord("scr_trev3_trailer_expolsion", explosionPos.x, explosionPos.y, explosionPos.z, 0, 0, 0, 1, false, false, false)

            // todo: play sound
        }
        if (game.getInteriorAtCoords(this.position.x, this.position.y, this.position.z) == 0) {
            // then we are not in house
            game.useParticleFxAsset("scr_agencyheistb")
            this.interiorSmokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.position.x, this.position.y, this.position.z, 0, 0, 0, 5, false, false, false, false)
        }

        this._initialized = true
    }

    public remove(triggerFireOutEvent: boolean) {
        //alt.log('fire remove')
        this.flames.forEach((flame) => {
            //alt.log('fire remove->flame remove')
            flame.remove()
        })
        this.flames = []
        if (this.smokePtfx != null) game.stopParticleFxLooped(this.smokePtfx, false)
        if (this.interiorSmokePtfx != null) game.stopParticleFxLooped(this.interiorSmokePtfx, false)
        if (triggerFireOutEvent) {
            alt.emitServer('FireScript:Server:FirePutOut', this.position.x, this.position.y, this.position.z)
        }
        this._active = false
    }

    public manage() {
        if (!this._initialized) return
        if (this.Active) {
            this.flames.forEach((flame) => {
                flame.manage()
            })
            this.flames.forEach((flame, index, array) => {
                if (!flame.Active) {
                    array.splice(index, 1)
                }
            })
            if (this.flames.length < 8) {
                this.remove(true)
            }
        }
    }
}





// helper
function normalizeVector(vector: alt.Vector3) {
    const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    return new alt.Vector3(vector.x / distance, vector.y / distance, vector.z)
}

function vecAdd(a: alt.Vector3, b: alt.Vector3) {
    return new alt.Vector3(
        a.x + b.x,
        a.y + b.y,
        a.z + b.z
    )
}

function vecMultiplyScalar(a: alt.Vector3, b: number) {
    return new alt.Vector3(
        a.x * b,
        a.y * b,
        a.z * b
    )
}

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
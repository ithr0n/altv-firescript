import alt from 'alt';
import Flame from './Flame';

export default class Fire {
    constructor(
        public readonly Id: number,
        public readonly Position: alt.Vector3,
        private readonly maxFlames: number = 20,
        private readonly maxSpreadDistance: number = 15,
        private readonly explosion: boolean = false) {
    }

    private _active: boolean = false
    get Active(): boolean {
        return this._active
    }

    private flames: Flame[] = []

    public start() {
        this._active = true

        alt.emitClient(null, 'FireScript:Client:StartLocalFire', this.Id, this.Position, this.maxSpreadDistance, this.explosion)

        for (let i = 0; i < this.maxFlames; i++) {
            //const direction = normalizeVector(new alt.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0))
            const direction = new alt.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0)
            const around = vecAdd(this.Position, vecMultiplyScalar(direction, this.maxSpreadDistance))
            this.flames.push(new Flame(this.Id, around))
            //alt.log(`${around.x} ${around.y} ${around.z} `)
        }
    }

    public remove() {
        //alt.log('fire remove')
        this.flames.forEach((flame) => {
            //alt.log('fire remove->flame remove')
            flame.remove()
        })
        this.flames = []
        alt.emitClient(null, 'FireScript:Client:RemoveFire', this.Id)
        this._active = false
    }

    public manage() {
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
                this.remove()
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
/*
function requestNamedPtfxAssetPromise(assetName: string) {
    return new Promise((resolve, reject) => {
        //if (!game.doesAnimDictExist(assetName))
        //    return resolve(false);

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
}*/
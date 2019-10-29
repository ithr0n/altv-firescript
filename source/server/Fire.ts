import alt from 'alt';
import Flame from './Flame';

export enum FireEvolveFlags {
    Default = 0,
    StartWithExplosion = 1 << 0, // explosion effect on the beginning
    StartWithSmoke = 1 << 1, // spawn small smoke in beginning, best in combination with Spread
    Spread = 1 << 2, // evolve by time
}

export default class Fire {
    constructor(
        public readonly Id: string,
        public readonly Position: alt.Vector3,
        private readonly maxFlames: number = 20,
        private readonly maxSpreadDistance: number = 15,
        private readonly evolveFlags: FireEvolveFlags = 0
    ) {
    }

    private _active: boolean = false
    get Active(): boolean {
        return this._active
    }

    private _initialized: boolean = false
    get Initialized(): boolean {
        return this._initialized
    }

    private fireStarted: number = -1
    private timekeeper: number = -1
    private currentStage: number = 1
    private maxStages: number = randomMinMax(3, 6)
    private flamesSpawned: boolean = false
    private flames: Map<string, Flame> = new Map<string, Flame>()

    public start() {
        this._initialized = true

        alt.emitClient(null, 'FireScript:Client:StartLocalFire', this.Id, this.Position, this.maxSpreadDistance, this.evolveFlags)

        this.timekeeper = Date.now()
        this.fireStarted = Date.now()
        this._active = true

        if (!(this.evolveFlags & FireEvolveFlags.Spread)) {
            for (let i = 0; i < this.maxFlames; i++) {
                this.addFlame(this.maxSpreadDistance, false)
            }

            this.flamesSpawned = true
        }

        if (this.evolveFlags & FireEvolveFlags.StartWithSmoke) {
            // first stage is only smoke -> increment max stages by one
            this.maxStages += 1
        }

        if (this.evolveFlags & FireEvolveFlags.StartWithExplosion) {
            this.addFlame(0, true)
        }
    }

    public remove() {
        alt.log('fire extinguished')

        this.flames.forEach((flame) => {
            //alt.log('fire remove->flame remove')
            flame.remove()
        })
        this.flames.clear()
        alt.emitClient(null, 'FireScript:Client:RemoveFire', this.Id)
        this._active = false
    }

    public manage() {
        if (this.Active) {
            if (Date.now() - this.fireStarted > 30 * 60 * 1000) {
                // delete fire after 30 minutes
                this.remove()
                return
            }

            if (this.evolveFlags & FireEvolveFlags.Spread) {
                if (this.currentStage <= this.maxStages) {
                    if (Date.now() - this.timekeeper > randomMinMax(40, 250) * 1000) {
                        alt.log(`fire set to stage ${this.currentStage} of ${this.maxStages}`)

                        this.timekeeper = Date.now()
                        this.currentStage += 1

                        if (this.evolveFlags & FireEvolveFlags.StartWithExplosion) {
                            alt.log('fire skips stage 2, because it was a gas explosion')
                            this.currentStage += 1
                        }

                        switch (this.currentStage) {
                            case 2:
                                // first flame
                                this.addFlame(0, false)
                                break

                            case 3:
                                this.addFlame(1, false)
                                this.addFlame(1, false)
                                this.addFlame(1, false)
                                break

                            default:
                                const flamesPerRound = Math.round(this.maxFlames / this.maxStages)
                                for (let i = 1; i < flamesPerRound; i++) {
                                    this.addFlame(Math.round(this.maxSpreadDistance / flamesPerRound * this.currentStage), false)
                                }
                                break
                        }

                        this.flamesSpawned = true
                    }
                }
            }

            if (this.flamesSpawned) {
                this.flames.forEach((flame) => {
                    flame.manage()
                })

                this.flames.forEach((value, key, map) => {
                    if (!value.Active) {
                        map.delete(key)
                    }
                })

                //alt.log(this.flames.size.toString())

                if (this.evolveFlags & FireEvolveFlags.Spread) {
                    if (this.flames.size < this.currentStage - 1) {
                        this.remove()
                    }
                } else {
                    if (this.flames.size < 8) {
                        this.remove()
                    }
                }
            }
        }
    }

    public respawnInvalidFlame() {
        if (this.evolveFlags & FireEvolveFlags.Spread) {
            const flamesPerRound = Math.round(this.maxFlames / this.maxStages)
            this.addFlame(Math.round(this.maxSpreadDistance / flamesPerRound * this.currentStage), false)
        } else {
            this.addFlame(this.maxSpreadDistance, false)
        }
    }

    private addFlame(maxDistance: number, isGasFire: boolean) {
        let around: alt.Vector3
        if (maxDistance > 0) {
            //const direction = normalizeVector(new alt.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0))
            const direction = new alt.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0)
            around = vecAdd(this.Position, vecMultiplyScalar(direction, maxDistance))
        } else {
            around = this.Position
        }

        const newFlame = new Flame(this.Id, around, isGasFire)
        this.flames.set(newFlame.Id, newFlame)
        //alt.log(`${around.x} ${around.y} ${around.z} `)
    }

    public removeFlame(flameId: string) {
        const flame = this.flames.get(flameId)

        if (flame) {
            flame.remove()
            this.flames.delete(flameId)
        }
    }
}





// helper
function randomMinMax(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}


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
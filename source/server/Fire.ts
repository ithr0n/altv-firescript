import alt from 'alt';
import Flame from './Flame';
import Helper from './Helper'

export enum FireEvolveFlags {
    Default = 0,
    StartWithExplosion = 1 << 0, // explosion effect on the beginning
    Spread = 1 << 1, // evolve by time
}

/*
 stages (only when spreading)
 [0: do not exist]
 1: only smoke
 2: first flame at spawn position (probably gas fire when explosion)
 3: three surrounding flames
 4 ... maxStages: dynamic flames
*/


export default class Fire {
    private fireStarted: number = -1
    private timekeeper: number = -1
    private currentStage: number
    private readonly maxStages: number
    private flamesSpawned: boolean = false
    private flames: [string, Flame][] = []
    private flamesPerRound: number = -1

    private _initialized: boolean = false
    public get Initialized() {
        return this._initialized
    }

    private _active: boolean = false
    public get Active() {
        return this._active
    }

    private _extinguished: boolean = false
    public get Extinguished() {
        return this._extinguished
    }

    constructor(
        public readonly Id: string,
        public readonly Position: alt.Vector3,
        private readonly maxFlames: number = 20,
        public readonly MaxSpreadDistance: number = 15,
        public readonly EvolveFlags: FireEvolveFlags = 0,
        private readonly creator: alt.Player
    ) {
        if (this.EvolveFlags & FireEvolveFlags.Spread) {
            this.currentStage = 1
            this.maxStages = 3 + Helper.randomMinMax(5, 10)
        }

        alt.emitClient(this.creator, 'FireScript:Client:InitializeFire', this.Id, this.Position, this.MaxSpreadDistance, this.EvolveFlags, this.maxFlames)

        //alt.log(`initialize fire id ${this.Id}`)
    }

    public initializeFlame(flameId: string, flamePosition: alt.Vector3) {
        const newFlame = new Flame(this.Id, flameId, flamePosition)
        this.flames.push([newFlame.Id, newFlame])
    }

    public setInitialized() {
        this._initialized = true
        this.flamesPerRound = Math.floor(this.maxFlames / (this.maxStages - 3))
    }

    public start() {
        if (this.fireStarted > 0) return

        if (!this._initialized) {
            //alt.log(`fire ${this.Id} not initialized, delaying start...`)
            setTimeout(() => this.start(), 1000)
            return
        }

        alt.emitClient(null, 'FireScript:Client:StartLocalFire', this.Id, this.Position, this.MaxSpreadDistance, this.EvolveFlags)

        this.timekeeper = Date.now()
        this.fireStarted = Date.now()
        this._active = true

        if (this.EvolveFlags & FireEvolveFlags.StartWithExplosion) {
            // skips stage 1, because fire started with gas explosion
            this.flames[0][1].start(true)
            this.currentStage = 2
            this.flamesSpawned = true
        }

        if (!(this.EvolveFlags & FireEvolveFlags.Spread)) {
            // no spreading -> spawn all flames immediately
            this.flames.forEach((flame) => {
                flame[1].start(false)
            })
            this.flamesSpawned = true
        }

        alt.log(`started fire id ${this.Id}, created by ${this.creator.charName}`)
    }

    public remove() {
        this.flames.forEach((flame) => {
            //alt.log('fire remove->flame remove')
            flame[1].remove()
        })
        this.flames = []
        alt.emitClient(null, 'FireScript:Client:RemoveLocalFire', this.Id)
        this._active = false
        alt.log(`stopped fire id ${this.Id}`)
    }

    public removeFlame(flameId: string) {
        const flameIdx = this.flames.findIndex(flame => flame[0] === flameId)
        //alt.log('remove flame ', flameIdx.toString())
        if (flameIdx >= 0) {
            this.flames[flameIdx][1].remove()
            this.flames.splice(flameIdx, 1)
        }
    }

    public manage() {
        if (!this.Initialized) return

        if (this.Active) {
            if (Date.now() - this.fireStarted > 30 * 60 * 1000) {
                // delete fire after 30 minutes
                this.remove()
                return
            }

            if (this.EvolveFlags & FireEvolveFlags.Spread) {
                if (this.currentStage <= this.maxStages) {
                    if (Date.now() - this.timekeeper > Helper.randomMinMax(40, 250) * 1000) {
                        this.timekeeper = Date.now()
                        this.currentStage += 1

                        //alt.log(`fire set to stage ${this.currentStage} of ${this.maxStages}`)

                        switch (this.currentStage) {
                            case 2:
                                // first flame (only possible, when no explosion)
                                this.flames[0][1].start(false)
                                break

                            case 3:
                                this.flames[1][1].start(false)
                                this.flames[2][1].start(false)
                                this.flames[3][1].start(false)
                                break

                            default:
                                for (let i = 0; i < this.flamesPerRound; i++) {
                                    const flameIdx = this.flamesPerRound * this.currentStage - 3 + i

                                    if (this.flames.length > flameIdx) {
                                        this.flames[flameIdx][1].start(false)
                                    }
                                }
                                break
                        }

                        this.flamesSpawned = true
                    }
                }
            }

            if (this.flamesSpawned) {
                // that means, currentStage is at least = 2

                this.flames.forEach((flame) => {
                    flame[1].manage()
                })

                // delete extinguished flames from array
                for (let i = this.flames.length - 1; i >= 0; --i) {
                    if (this.flames[i][1].Removed) {
                        //alt.log(`flame ${this.flames[i][0]} of fire ${this.Id} removed`)
                        this.flames.splice(i, 1)
                    }
                }

                const burningFlames = this.flames.filter((item) => item[1].Active)
                //alt.log(burningFlames.length.toString())

                if (this.EvolveFlags & FireEvolveFlags.Spread) {
                    if (burningFlames.length <= this.currentStage - 2) {
                        this.remove()
                        this._extinguished = true
                    }
                } else {
                    if (burningFlames.length < 4) {
                        this.remove()
                        this._extinguished = true
                    }
                }
            }
        }
    }
}

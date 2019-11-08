import alt from 'alt'
import game from 'natives'
import LocalFlame from './LocalFlame'
import LocalHelper from './LocalHelper';

export default class cFire {
    private static readonly Range = 500

    private miniSmokePtfx: number | null = null
    private smokePtfx: number | null = null
    private interiorSmokePtfx: number | null = null
    private flames: Map<string, LocalFlame> = new Map<string, LocalFlame>()
    private bigSmokeSpawned: boolean = false
    private started: boolean = false

    constructor(
        public readonly Id: string,
        public readonly Position: alt.Vector3,
        public readonly MaxSpreadDistance: number,
        public readonly EvolveFlags: number
    ) { }

    public init(maxFlames: number) {
        // is only executed for the creator of the fire

        // init flame positions
        const flamePositions: [string, alt.Vector3][] = []

        // these flames always exist
        flamePositions.push([LocalHelper.generateId(), this.Position])
        flamePositions.push([LocalHelper.generateId(), cFire.FindSafePositionNear(this.Position, 1)])
        flamePositions.push([LocalHelper.generateId(), cFire.FindSafePositionNear(this.Position, 1)])
        flamePositions.push([LocalHelper.generateId(), cFire.FindSafePositionNear(this.Position, 1)])

        for (let i = 0; i < maxFlames; i++) {
            flamePositions.push([LocalHelper.generateId(), cFire.FindSafePositionNear(this.Position, this.MaxSpreadDistance)])
        }

        alt.emitServer('FireScript:Server:FireInitialized', this.Id, flamePositions)

        //alt.log(`intialized fire id ${this.Id}`)
    }

    private static FindSafePositionNear(position: alt.Vector3, maxDistance: number) {
        if (maxDistance <= 0) throw Error('maxDistance must be greater than 0')
        let around: alt.Vector3 | null = null

        do {
            //const direction = normalizeVector(new alt.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0))
            const direction = new alt.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0)
            around = LocalHelper.vecAdd(position, LocalHelper.vecMultiplyScalar(direction, maxDistance))

            let res = game.getGroundZFor3dCoord(around.x, around.y, around.z + 5, 0, false,);

            if (res[0]) {
                around.z = res[1]
            } else {
                // no ground position found, happens probably when spawning fire inside of a building
                //alt.log('flame no ground position found')
                around = null
            }
        } while (!around)

        return around
    }

    public async start() {
        await LocalHelper.requestNamedPtfxAssetPromise("scr_agencyheistb")
        game.useParticleFxAsset("scr_agencyheistb")
        this.miniSmokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.Position.x, this.Position.y, this.Position.z, 0, 0, 0, 0.3, false, false, false, false)

        if (!(this.EvolveFlags & (1 << 1))) { // not spreading
            await this.spawnBigSmoke()
        }

        if (this.EvolveFlags & (1 << 0)) { // start with explosion
            await this.spawnBigSmoke()
            if (LocalHelper.dist(alt.Player.local.pos, this.Position) <= cFire.Range) {
                game.shakeGameplayCam("MEDIUM_EXPLOSION_SHAKE", 1)
                await LocalHelper.requestNamedPtfxAssetPromise("scr_trevor3")
                const explosionPos = this.Position
                explosionPos.z += 1
                game.startParticleFxNonLoopedAtCoord("scr_trev3_trailer_expolsion", explosionPos.x, explosionPos.y, explosionPos.z, 0, 0, 0, 1, false, false, false)
                game.playSoundFromCoord(-1, "MAIN_EXPLOSION_CHEAP", this.Position.x, this.Position.y, this.Position.z, '', false, cFire.Range, false)
            }
        }

        //alt.log(`started fire id ${this.Id}`)
    }

    public remove() {
        //alt.log('local fire remove')
        if (this.miniSmokePtfx != null) game.stopParticleFxLooped(this.miniSmokePtfx, false)
        if (this.smokePtfx != null) game.stopParticleFxLooped(this.smokePtfx, false)
        if (this.interiorSmokePtfx != null) game.stopParticleFxLooped(this.interiorSmokePtfx, false)

        // just in case check flames again
        this.flames.forEach((flame => {
            flame.stop()
        }))
        this.flames.clear()

        //alt.log(`stopped fire id ${this.Id}`)
    }

    private async spawnBigSmoke() {
        if (this.bigSmokeSpawned) return
        this.bigSmokeSpawned = true

        await LocalHelper.requestNamedPtfxAssetPromise("scr_agencyheistb")
        game.useParticleFxAsset("scr_agencyheistb")
        this.smokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.Position.x, this.Position.y, this.Position.z, 0, 0, 0, this.MaxSpreadDistance * 0.5, false, false, false, false)

        if (game.getInteriorAtCoords(this.Position.x, this.Position.y, this.Position.z) == 0) {
            // additional bigger smoke when not in house
            game.useParticleFxAsset("scr_agencyheistb")
            this.interiorSmokePtfx = game.startParticleFxLoopedAtCoord("scr_env_agency3b_smoke", this.Position.x, this.Position.y, this.Position.z, 0, 0, 0, 5, false, false, false, false)
        }
    }

    public addFlame(flame: LocalFlame) {
        this.flames.set(flame.Id, flame)
        this.spawnBigSmoke()
    }

    public removeFlame(flameId: string) {
        const flame = this.flames.get(flameId)
        if (flame) {
            flame.stop()
            this.flames.delete(flameId)
        }
    }

    public manageFlame(flameId: string) {
        const flame = this.flames.get(flameId)
        if (flame) {
            flame.manage()
        }
    }

    public getFlamePositions() {
        const result: [string, alt.Vector3][] = []

        this.flames.forEach((flame) => {
            result.push([flame.Id, flame.Position])
        })
    }
}

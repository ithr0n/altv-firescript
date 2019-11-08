import alt from 'alt';
import game from 'natives';
import LocalHelper from './LocalHelper';

export default class LocalFlame {
    private static readonly Range: number = 600

    private active: boolean = false
    private scriptFireId: number | null = null
    private flamePtfx: number | null = null

    public get Id() {
        return this.flameId
    }

    public get Position() {
        return this.position
    }

    constructor(
        private readonly fireId: string,
        private readonly flameId: string,
        private position: alt.Vector3,
        private readonly isGasFire: boolean
    ) { }

    public start() {
        if (this.active || LocalHelper.dist(this.position, alt.Player.local.pos) > LocalFlame.Range) {
            return
        }

        this.scriptFireId = game.startScriptFire(this.position.x, this.position.y, this.position.z, 25, this.isGasFire)

        LocalHelper.requestNamedPtfxAssetPromise("scr_trevor3").then(() => {
            const smokePos = this.position
            smokePos.z += 0.4
            game.useParticleFxAsset("scr_trevor3")
            this.flamePtfx = game.startParticleFxLoopedAtCoord("scr_trev3_trailer_plume", smokePos.x, smokePos.y, smokePos.z, 0, 0, 0, 0.7, false, false, false, false)
        })

        this.active = true
    }

    public stop() {
        //alt.log('local flame remove')
        if (this.scriptFireId != null) game.removeScriptFire(this.scriptFireId)
        //game.stopFireInRange(this.position.x, this.position.y, this.position.z, 20)
        if (this.flamePtfx != null) game.stopParticleFxLooped(this.flamePtfx, false)
        this.active = false
    }

    public manage() {
        if (!this.active) {
            if (LocalHelper.dist(this.position, alt.Player.local.pos) < LocalFlame.Range) {
                this.start()
                //alt.log(`resumed flame ${this.Id} of fire ${this.fireId}`)
            }

            return
        }

        if (LocalHelper.dist(this.position, alt.Player.local.pos) > LocalFlame.Range) {
            // out of range - pause this script
            //alt.log(`paused flame ${this.Id} of fire ${this.fireId}`)
            this.stop()
            return
        }

        const numberInRange = game.getNumberOfFiresInRange(this.position.x, this.position.y, this.position.z, 2)
        if (numberInRange < 1) {
            //alt.log('local flame extinguished, start request to server')
            alt.emitServer('FireScript:Server:FlameExtinguished', this.fireId, this.flameId)
        }
    }
}

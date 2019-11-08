import alt from 'alt'

export default class Flame {
    private _active: boolean = false
    public get Active() {
        return !this.Removed && this._active
    }

    private _removed: boolean = false
    public get Removed() {
        return this._removed
    }

    public get Id() {
        return this.flameId
    }

    public set Position(pos: alt.Vector3) {
        this.position = pos
    }

    constructor(
        private readonly fireId: string,
        private readonly flameId: string,
        private position: alt.Vector3
    ) { }

    public start(isGasFire: boolean) {
        if (this.Active) return
        this._active = true
        alt.emitClient(null, 'FireScript:Client:SpawnLocalFlame', this.fireId, this.Id, this.position, isGasFire)
    }

    public remove() {
        this._active = false
        this._removed = true
        alt.emitClient(null, 'FireScript:Client:RemoveLocalFlame', this.fireId, this.Id, this.position)
        //alt.log(`flame ${this.Id} of fire ${this.fireId} marked for remove`)
    }

    public manage() {
        if (!this.Active) return
        alt.emitClient(null, 'FireScript:Client:ManageFlame', this.fireId, this.Id)
    }
}
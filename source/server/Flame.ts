import alt from 'alt';

export default class Flame {
    constructor(
        private readonly fireId: number,
        private readonly position: alt.Vector3
    ) {
        this.id = Flame.generateId()
        this.start()
    }

    private readonly id: string

    private _active: boolean = false
    get Active(): boolean {
        return this._active
    }

    public start() {
        this._active = true
        alt.emitClient(null, 'FireScript:Client:StartLocalFlame', this.fireId, this.id, this.position)
    }

    public remove() {
        //alt.log('flame remove')
        alt.emitClient(null, 'FireScript:Client:RemoveLocalFlame', this.fireId, this.id, this.position)
        this._active = false
    }

    public manage() {
        alt.emitClient(null, 'FireScript:Client:ManageFlame', this.fireId, this.id, this.Active)
    }

    private static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9)
    }
}




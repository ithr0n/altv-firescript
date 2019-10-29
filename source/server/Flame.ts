import alt from 'alt';

export default class Flame {
    constructor(
        private readonly fireId: string,
        private readonly position: alt.Vector3,
        private readonly isGasFire: boolean
    ) {
        this.Id = Flame.generateId()
        this.start()
    }

    public readonly Id: string
    
    private _active: boolean = false
    get Active(): boolean {
        return this._active
    }

    public start() {
        this._active = true
        alt.emitClient(null, 'FireScript:Client:StartLocalFlame', this.fireId, this.Id, this.position, this.isGasFire)
    }

    public remove() {
        //alt.log('flame remove')
        this._active = false
        alt.emitClient(null, 'FireScript:Client:RemoveLocalFlame', this.fireId, this.Id, this.position)
    }

    public manage() {
        alt.emitClient(null, 'FireScript:Client:ManageFlame', this.fireId, this.Id, this.Active)
    }

    private static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9)
    }
}




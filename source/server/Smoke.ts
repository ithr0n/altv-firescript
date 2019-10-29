import alt from 'alt'

export default class Smoke {
    constructor(
        public readonly Position: alt.Vector3,
        private readonly scale: number
    ) {
        this.Id = Smoke.generateId()
        //alt.log(this.Id)
        this.start()
    }

    public readonly Id: string

    start() {
        //alt.log('start smoke emit client')
        alt.emitClient(null, 'FireScript:Client:StartSmoke', this.Id, this.Position, this.scale)
    }

    private static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9)
    }
}
import alt from 'alt'
import Helper from '../Helper'

export default class Smoke {
    constructor(
        public readonly Position: alt.Vector3,
        private readonly scale: number
    ) {
        this.Id = sHelper.generateId()
        //alt.log(this.Id)
        this.start()
    }

    public readonly Id: string

    start() {
        //alt.log('start smoke emit client')
        alt.emitClient(null, 'FireScript:Client:StartSmoke', this.Id, this.Position, this.scale)
    }
}
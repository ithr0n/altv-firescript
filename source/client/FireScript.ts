import alt from 'alt'
import game from 'natives'
import LocalFire from './LocalFire'
import LocalFlame from './LocalFlame'

// old
/*
alt.on('FireScript:Client:StopFireAtPosition', (x: number, y: number, z: number) => {
    stopFires(true, new alt.Vector3(x, y, z), 3)
})

alt.on('FireScript:Client:StartSmokesAtPlayer', (source: alt.Player, scale: number) => {
    startSmoke(source, scale)
})

alt.on('FireScript:Client:StopSmoke', () => {
    stopSmoke(true, alt.Player.local.pos)
})

alt.on('FireScript:Client:StopAllSmoke', () => {
    stopSmoke(false, new alt.Vector3(0, 0, 0))
})*/




// new
const fires: Map<number, LocalFire> = new Map<number, LocalFire>()

alt.onServer('FireScript:Client:StartLocalFire', async (fireId: number, position: alt.Vector3, maxSpreadDistance: number, explosion: boolean) => {
    const fire = new LocalFire(fireId, position, maxSpreadDistance, explosion)
    fire.start()
    
    fires.set(fireId, fire)
})

alt.onServer('FireScript:Client:RemoveFire', (fireId: number) => {
    const fire = fires.get(fireId)

    if (fire) {
        fire.remove()
    }
})


alt.onServer('FireScript:Client:StartLocalFlame', (fireId: number, flameId: number, position: alt.Vector3) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.addFlame(new LocalFlame(flameId, position))
    }
})

alt.onServer('FireScript:Client:RemoveLocalFlame', (fireId: number, flameId: number) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.removeFlame(flameId)
    }
})

alt.onServer('FireScript:Client:ManageFlame', (fireId: number, flameId: number, isFlameActive: boolean) => {
    const fire = fires.get(fireId)
    if (fire) {
        fire.manageFlame(flameId, isFlameActive)
    }
})
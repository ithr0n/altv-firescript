import alt from 'alt'
import game from 'natives'

export default abstract class LocalHelper {
    public static requestNamedPtfxAssetPromise(assetName: string) {
        return new Promise((resolve, reject) => {
            /*if (!game.doesAnimDictExist(assetName))
                return resolve(false);*/
    
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
    }
    
    public static vecAdd(a: alt.Vector3, b: alt.Vector3) {
        return new alt.Vector3(
            a.x + b.x,
            a.y + b.y,
            a.z + b.z
        )
    }

    public static vecMultiplyScalar(a: alt.Vector3, b: number) {
        return new alt.Vector3(
            a.x * b,
            a.y * b,
            a.z * b
        )
    }

    public static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9)
    }

    public static dist(v1: alt.Vector3, v2: alt.Vector3) {
        return Math.sqrt(LocalHelper.distSquared(v1, v2))
    }

    private static distSquared(v1: alt.Vector3, v2: alt.Vector3) {
        const x = (v1.x - v2.x)
        const y = (v1.y - v2.y)
        const z = (v1.z - v2.z)
        return (x * x) + (y * y) + (z * z);
    }
}

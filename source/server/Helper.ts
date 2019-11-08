import alt from 'alt'

export default abstract class Helper {
    /**
     * Returns a random integer that is within a specified range.
     * @param minValue The inclusive lower bound of the random number returned.
     * @param maxValue The exclusive upper bound of the random number returned. maxValue must be greater than or equal to minValue.
     * @throws Will throw an error if maxValue is less than minValue.
     */
    public static randomMinMax(minValue: number, maxValue: number) {
        if (maxValue < minValue) throw new Error('maxValue must be greater than or equal to minValue.')
        return Math.floor(Math.random() * (maxValue - minValue) + minValue)
    }

    public static dist(v1: alt.Vector3, v2: alt.Vector3) {
        return Math.sqrt(Helper.distSquared(v1, v2))
    }

    private static distSquared(v1: alt.Vector3, v2: alt.Vector3) {
        const x = (v1.x - v2.x)
        const y = (v1.y - v2.y)
        const z = (v1.z - v2.z)
        return (x * x) + (y * y) + (z * z);
    }

    public static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9)
    }
}
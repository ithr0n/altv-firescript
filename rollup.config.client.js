import path from 'path';
import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
//import autoExternal from 'rollup-plugin-auto-external';
import json from 'rollup-plugin-json';
//import { terser } from "rollup-plugin-terser";
//import globals from 'rollup-plugin-node-globals';

export default {
    input: path.resolve(__dirname, './source/client/client.ts'),
    output: {
        file: './build/client.bundle.js',
        format: 'esm'
    },
    external: [
        'alt', 'natives'
    ],
    plugins: [
        typescript(),
        /*autoExternal({
            builtins: true,
            dependencies: false,
            packagePath: path.resolve('./package.json'),
            peerDependencies: false
        }),*/
        resolve(),
        //globals(),
        builtins(),
        json(),
        //terser()
    ],
}
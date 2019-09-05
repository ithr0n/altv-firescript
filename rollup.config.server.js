import path from 'path';
import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import autoExternal from 'rollup-plugin-auto-external';
import json from 'rollup-plugin-json'
//import globals from 'rollup-plugin-node-globals';

export default {
    input: path.resolve(__dirname, './source/server/server.ts'),
    output: {
        file: './build/server.bundle.mjs',
        format: 'esm'
    },
    external: [
        'alt'
    ],
    plugins: [
        typescript(),
        autoExternal({
            builtins: false, //true
            dependencies: true, // false
            packagePath: path.resolve('./package.json'),
            peerDependencies: false
        }),
        builtins(),
        resolve(),
        json(),
        //terser(),
        /*commonjs({
            include: [
                'node_modules/**',
            ]
        }),
        globals(),*/
    ],
}
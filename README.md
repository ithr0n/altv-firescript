# altv-resource-typescript-template
This resource is based on TypeScript and RollupJS and can be used to start with your own resource.
Remember that you need to compile your TypeScript files before pushing them on the server.
The files loaded by the server will be generated in the folder "build":
- client.bundle.js
- server.bundle.mjs

## How to compile
To compile your scripts into JavaScript you have to run the command `npm run build`.
You can also use `tsc --watch` once to automatically compile scripts on changes (probably you have to use `npx tsc --watch`).

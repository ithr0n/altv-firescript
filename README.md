# Not stable - you should not use this resource
Only use that as reference how to spawn particles and scriptFires.\
If you want synced fire you should write a new system based on streamers.\
Take any other streamer as reference, available at https://hub.altv.mp/
\
\
.

# altv-resource-typescript-template
This resource is based on TypeScript and RollupJS and can be used to start with your own resource.
Remember that you need to compile your TypeScript files before pushing them on the server.
The files loaded by the server will be generated in the folder "build":
- client.bundle.js
- server.bundle.mjs

## How to compile
To compile your scripts into JavaScript you have to run the command `npm run build`.
You can also use `tsc --watch` once to automatically compile scripts on changes (probably you have to use `npx tsc --watch`).

## Warning
With many players on your server this script will probably disconnect all players after some time. I believe that this belongs to altV network stuff and with the next release this could be fixed.

## Credits
Based on https://forum.fivem.net/t/release-fire-script-by-albo1125/275069

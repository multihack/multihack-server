# multihack-server
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Supercharge your IDE with realtime collaboration features! (Server)

## Installation
```
git clone --recursive https://github.com/RationalCoding/multihack-server/
cd multihack-server
npm install
node app.js
```


It provides signaling for the P2P connections, as well as a forwarding proxy for those without WebRTC support.

- The server automatically provides [multihack-web](https://github.com/RationalCoding/multihack-web).  

- To point [multihack-brackets](https://github.com/RationalCoding/multihack-web) at your custom server, change the Brackets preference "multihack-brackets.hostname"

- To point [multihack-vscode](https://github.com/RationalCoding/multihack-vscode), set the "multihack.hostname" workspace config option.

**NOTE:** Hostnames must have a protocol, port and no path. ie) `https://localhost:8000` or `http://localhost:8000`.

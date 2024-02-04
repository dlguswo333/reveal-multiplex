# @dlguswo333/revealjs-multiplex
This package aims to serve revealjs multiplex feature in modern way.
**It's helpful when you want to control other browser tabs or devices.**

## Features
- Support modern module systems: ESM and CJS.
- Built upon up-to-date dependencies: `fastify@^4.25.2`
- Serve your static files. All you need to do is point the static file path.

## How to
Start your server on Node.js.
```js
import {setupServer} from '@dlguswo333/reveal-multiplex/server'

setupServer({
    host: '192.168.0.2',
    port: 8080,
    secret: 'q1w2e3r4',
    staticDir: './public'
})
```

<br>

Import the client script and call setup functions.
One feasible code example is the following.
```js
import {setupMasterToken, setupMaster, setupClient} from '@dlguswo333/reveal-multiplex/client'

setupMasterToken()
if (getIsMaster()) {
    setupMaster(Reveal)
} else {
    setupClient(Reveal)
}
```


Open a browser tab and connect to your server with secret parameter.
With the valid secret, the tab will the master which controls clients.
```
http://192.168.0.2:8080/?secret=q1w2e3r4
```

<br>

Access to the server on a browser tab without specifying secret parameter.
Without the secret, the tab will be a client.
```
http://192.168.0.2:8080/
```

<br>

When the master slides, change the view, clients react to the events
and do the same.


## Configurations
| Config | Description | Default |
| :--: | ---- | ---- |
| `secret` | Secret key for master to possess. grant master token to every socket if undefined. | `undefined` |
| `host` | Network host where the server is hosted. | `0.0.0.0` (for convenience) |
| `port` | Network port where the server is hosted. | `80` |
| `staticDir` | File path to static assets (e.g. `index.html`). Can be absolute or relative. | `./public` |


## Caveats
- It does not support secure connections as of now. Please use it on secure network.
- Every time the server restarts, you need to reconnect the master as it forgets the previous master token.

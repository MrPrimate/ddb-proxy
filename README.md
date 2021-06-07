# ddb-proxy

This proxy allows for communication with DDB for use integrating content into Foundry VTT.

It provides the following backend functionality for [ddb-importer](https://github.com/MrPrimate/ddb-importer)

* Characters
* Spells
* Items
* Monsters


## Setup

You need to be using ddb-importer version 0.6.32 or higher.

Run this as a nodeJS app the standard way.

It _must_ be proxied behind a service providing an SSL/TLS encryption if you are not running on your local machine.

In the web browsers developer console run the following commands:

```javascript
game.settings.set("ddb-importer", "custom-proxy", true);
game.settings.set("ddb-importer", "api-endpoint", "YOUR_URL_HERE");
```

To revert:
```
game.settings.set("ddb-importer", "api-endpoint", "https://proxy.ddb.mrprimate.co.uk");
game.settings.set("ddb-importer", "custom-proxy", false);
```

## Why is x feature missing

This is a cut down, MVP implementation of the proxy, it is meant for individual use and does not implement caching. It should not be run as a service for others.

It does not include and features in development.


## Support

No support is provided for this software.

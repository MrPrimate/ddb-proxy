const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const Cache = require("./cache.js");

var CACHE_CONFIG = new Cache("CONFIG", 1);

const getConfig= () => {
  return new Promise((resolve, reject) => {
    console.log("Retrieving ddb config");

    const cache = CACHE_CONFIG.exists("DDB_CONFIG");
    console.warn(cache);
    if (cache !== undefined) {
      console.log("CONFIG API CACHE_CONFIG HIT!");
      return resolve(cache.data);
    }

    const url = CONFIG.urls.configUrl;
    const options = {
      credentials: "include",
      headers: {
        "User-Agent": "Foundry VTT Character Integrator",
        "Accept": "*/*",
      },
      method: "GET",
      mode: "cors",
      redirect: "follow",
    };

    fetch(url, options)
      .then(res => res.json())
      .then(json => {
        if (json && json.sources) {
          CACHE_CONFIG.add("DDB_CONFIG", json);
          console.log(
            "Adding CACHE_CONFIG to cache..."
          );
          resolve(json);
        } else {
          console.log("Received no valid config data, instead:" + json);
          reject(json);
        }
      })
      .catch(error => {
        console.log("Error retrieving DDB Config");
        console.log(error);
        reject(error);
      });

  });
};

exports.getConfig = getConfig;

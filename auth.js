const crypto = require("crypto");
const Cache = require("./cache");
const fetch = require("node-fetch");
const CONFIG = require("./config.js");

var CACHE_AUTH = new Cache("AUTH", 0.08);

function getBearerToken(id, cobalt) {
  return new Promise((resolve) => {
    if (cobalt && cobalt !== ""){
      fetch(CONFIG.urls.authService, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `CobaltSession=${cobalt}`
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.token || !data.token.length) resolve(null);
          CACHE_AUTH.add(id, data.token);
          resolve(data.token);
        });
    } else {
      console.log("NO COBALT TOKEN");
      resolve(null);
      //reject('No cobaltID token!');
    }
  });
}


function getCacheId(value) {
  const hash = crypto.createHash("sha256");
  hash.update(value);
  const cacheId = hash.digest("hex");
  return cacheId;
}



exports.CACHE_AUTH = CACHE_AUTH;
exports.getBearerToken = getBearerToken;
exports.getCacheId = getCacheId;

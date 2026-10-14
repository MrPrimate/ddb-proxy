const crypto = require("crypto");
const Cache = require("./cache");
const CONFIG = require("./config.js");

var CACHE_AUTH = new Cache("AUTH", 0.08);

function isJSON(str) {
  try {
    return (JSON.parse(str) && !!str);
  } catch {
    return false;
  }
}

function getBearerToken(id, cobalt) {
  return new Promise((resolve) => {
    if (cobalt && cobalt !== "" && !isJSON(`{ "cobalt": "${cobalt}" }`)) {
      console.log(`Invalid token for ${id}`);
      return null;
    } else if (cobalt && cobalt !== "") {
      fetch(CONFIG.urls.authService, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `CobaltSession=${cobalt}`,
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



/**
 * Fetch the D&D Beyond account details for a cobalt token
 */
function getUserData(cobalt) {
  const body = new URLSearchParams();
  body.append("token", `${cobalt}`);
  return fetch(CONFIG.urls.userData, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    redirect: "follow",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.status !== "success") throw new Error(result.message ?? "Unexpected user data response");
      return result.data ?? result;
    })
    .catch((error) => {
      console.log("Error retrieving user data");
      console.log(error);
      return { error: true, message: "Unable to authenticate, check Cobalt value" };
    });
}

exports.CACHE_AUTH = CACHE_AUTH;
exports.getBearerToken = getBearerToken;
exports.getCacheId = getCacheId;
exports.getUserData = getUserData;

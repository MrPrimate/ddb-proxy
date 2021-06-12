const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");


const isValidData = data => {
  return data.success === true;
};


const extractFeats = (cobaltId, campaignId) => {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving feats for ${cobaltId}`);

    console.log("featS API CACHE_featS MISS!");
    const url = CONFIG.urls.featsAPI(campaignId);
    const headers = (authentication.CACHE_AUTH.exists(cobaltId).data !== null) ? {headers: {"Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`}} : {};
    fetch(url, headers)
      .then(res => res.json())
      .then(json => {
        // console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidData(json)) {
          const filteredFeats = json.data.filter(feat_ =>
            feat_.sources && (feat_.sources.length === 0 || feat_.sources.some((source) => source.sourceId != 39))
          );
          console.log(
            `Adding ${filteredFeats.length} feats available to cache for ${cobaltId}...`
          );
          resolve(filteredFeats);
        } else {
          console.log("Received no valid feat data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving feats");
        console.log(error);
        reject(error);
      });
  });
};

exports.extractFeats = extractFeats;

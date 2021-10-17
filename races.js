const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");


const isValidData = data => {
  return data.success === true;
};


const extractRaces = (cobaltId, campaignId) => {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving races for ${cobaltId}`);

    console.log("raceS API CACHE_featS MISS!");
    const url = CONFIG.urls.racesAPI(campaignId);
    const headers = (authentication.CACHE_AUTH.exists(cobaltId).data !== null) ? {headers: {"Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`}} : {};
    fetch(url, headers)
      .then(res => res.json())
      .then(json => {
        // console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidData(json)) {
          const filteredRaces = json.data.filter(race_ =>
            race_.sources && (race_.sources.length === 0 || race_.sources.some((source) => source.sourceId != 39))
          );
          console.log(
            `Adding ${filteredRaces.length} races available to cache for ${cobaltId}...`
          );
          resolve(filteredRaces);
        } else {
          console.log("Received no valid race data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving races");
        console.log(error);
        reject(error);
      });
  });
};

exports.extractRaces = extractRaces;

const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");


const isValidData = data => {
  return data.success === true;
};


const extractVehicles = (cobaltId, campaignId) => {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving vehicles for ${cobaltId}`);

    console.log("VEHICLES API CACHE_ITEMS MISS!");
    const url = CONFIG.urls.vehiclesAPI(campaignId);
    const headers = (authentication.CACHE_AUTH.exists(cobaltId).data !== null) ? {headers: {"Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`}} : {};
    fetch(url, headers)
      .then(res => res.json())
      .then(json => {
        // console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidData(json)) {
          const filteredVehicles = json.data.filter(vehicle =>
            vehicle.sources && (vehicle.sources.length === 0 || vehicle.sources.some((source) => source.sourceId != 39))
          );
          console.log(
            `Adding ${filteredVehicles.length} vehicle available to cache for ${cobaltId}...`
          );
          resolve(filteredVehicles);
        } else {
          console.log("Received no valid vehicle data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving vehicles");
        console.log(error);
        reject(error);
      });
  });
};

exports.extractVehicles = extractVehicles;

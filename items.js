const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");


const isValidData = data => {
  return data.success === true;
};


const extractItems = (cobaltId, campaignId) => {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving items for ${cobaltId}`);

    console.log("ITEMS API CACHE_ITEMS MISS!");
    const url = CONFIG.urls.itemsAPI(campaignId);
    const headers = (authentication.CACHE_AUTH.exists(cobaltId).data !== null) ? {headers: {"Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`}} : {};
    fetch(url, headers)
      .then(res => res.json())
      .then(json => {
        // console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidData(json)) {
          const filteredItems = json.data.filter(item =>
            item.sources && (item.sources.length === 0 || item.sources.some((source) => source.sourceId != 39))
          );
          console.log(
            `Adding ${filteredItems.length} items available to cache for ${cobaltId}...`
          );
          resolve(filteredItems);
        } else {
          console.log("Received no valid item data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving items");
        console.log(error);
        reject(error);
      });
  });
};

exports.extractItems = extractItems;

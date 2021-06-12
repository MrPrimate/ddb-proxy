const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");


const isValidData = data => {
  return data.success === true;
};


const extractClasses = (cobaltId, campaignId) => {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving classs for ${cobaltId}`);

    console.log("CLASSS API CACHE_CLASSS MISS!");
    const url = CONFIG.urls.classesAPI(campaignId);
    const headers = (authentication.CACHE_AUTH.exists(cobaltId).data !== null) ? {headers: {"Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`}} : {};
    fetch(url, headers)
      .then(res => res.json())
      .then(json => {
        // console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidData(json)) {
          const filteredClasses = json.data.filter(class_ =>
            class_.sources && (class_.sources.length === 0 || class_.sources.some((source) => source.sourceId != 39))
          );
          console.log(
            `Adding ${filteredClasses.length} classs available to cache for ${cobaltId}...`
          );
          resolve(filteredClasses);
        } else {
          console.log("Received no valid class data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving classs");
        console.log(error);
        reject(error);
      });
  });
};

exports.extractClasses = extractClasses;

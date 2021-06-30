// This data is the light version of data available in the character builder
const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");

const getCampaigns = (cobaltId) => {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving campaigns for ${cobaltId}`);
    // console.log(authentication.CACHE_AUTH.exists(cobaltId).data);

    const url = CONFIG.urls.campaignsAPI;
    const options = {
      credentials: "include",
      headers: {
        "User-Agent": "Foundry VTT Character Integrator",
        "Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`,
        "Sec-GPC": "1",
        "Accept": "*/*",
        "Accept-Language": "en-GB,en;q=0.5",
      },
      method: "GET",
      mode: "cors",
    };

    fetch(url, options)
      .then((res) => {
        return res;
      })
      .then((res) => res.text())
      .then((text) => {
        const json = JSON.parse(text);
        // console.log(json);
        if (json.status == "success") {
          resolve(json.data);
        } else {
          console.log("Received no valid campaign data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch((error) => {
        console.log("Error retrieving campaigns");
        console.log(error);
        reject(error);
      });
  });
};

exports.getCampaigns = getCampaigns;

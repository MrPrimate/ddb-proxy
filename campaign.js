// This data is the light version of data available in the character builder
const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");

const getCampaigns = (cobalt, cobaltId) => {
  //return [];
  return new Promise((resolve, reject) => {
    console.log(`Retrieving campaigns for ${cobaltId}`);
    // console.log(authentication.CACHE_AUTH.exists(cobaltId).data);

    const url = CONFIG.urls.campaignsAPI;
    const options = {
      credentials: "include",
      headers: {
        'User-Agent': "Foundry VTT Character Integrator",
        'Accept': "*/*",
        'Cookie': `cobalt-token=${authentication.CACHE_AUTH.exists(cobaltId).data}; CobaltSession=${cobalt}`,
      },
      method: "GET",
      mode: "cors",
      redirect: "follow",
    };


    fetch(url, options)
      .then(res => {
        return res;
      })
      .then(res => res.text())
      .then(text => {
        const json = JSON.parse(text);
        // console.log(json);
        if (json.status == "success") {
          resolve(json.data);
        } else {
          console.log("Received no valid campaign data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving campaigns");
        console.log(error);
        reject(error);
      });

  });
};

exports.getCampaigns = getCampaigns;

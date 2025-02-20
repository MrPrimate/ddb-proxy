const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");

const isValidData = data => {
  return data.success === true;
};


const extractClassOptions = (cobaltId, optionIds = [], campaignId = null) => {
  console.log(optionIds);

  return new Promise((resolve, reject) => {
    console.log(`Retrieving class options for ${cobaltId}`);

    const url = CONFIG.urls.classOptionsAPI();
    const body = JSON.stringify({
      "campaignId": campaignId,
      "sharingSetting": 2,
      "ids": optionIds,
    });

    const auth = authentication.CACHE_AUTH.exists(cobaltId);
    const headers = (auth && auth.data) ? {
      "Authorization": `Bearer ${auth.data}`,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    } : {};

    const options = {
      method: "POST",
      headers: headers,
      body: body
    };

    fetch(url, options)
      .then(res => res.json())
      .then(json => {
        if (isValidData(json)) {
          const filteredItems = json.data.definitionData.filter(option =>
            option.sources && (option.sources.length === 0 || option.sources.some((source) => source.sourceId != 39))
          );
          resolve(filteredItems);
        } else {
          console.log("Received no valid class option data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving class options");
        console.log(error);
        reject(error);
      });
  });
};


const extractRacialTraitsOptions = (cobaltId, optionIds = [], campaignId = null) => {
  console.log(optionIds);

  return new Promise((resolve, reject) => {
    console.log(`Retrieving origin options for ${cobaltId}`);

    const url = CONFIG.urls.racialTraitOptionsAPI();
    const body = JSON.stringify({
      "campaignId": campaignId,
      "sharingSetting": 2,
      "ids": optionIds,
    });

    const auth = authentication.CACHE_AUTH.exists(cobaltId);
    const headers = (auth && auth.data) ? {
      "Authorization": `Bearer ${auth.data}`,
      "Content-Type": "application/json",
      "Content-Length": body.length,
    } : {};

    const options = {
      method: "POST",
      headers: headers,
      body: body
    };

    fetch(url, options)
      .then(res => res.json())
      .then(json => {
        if (isValidData(json)) {
          const filteredItems = json.data.definitionData.filter(option =>
            option.sources && (option.sources.length === 0 || option.sources.some((source) => source.sourceId != 39))
          );
          resolve(filteredItems);
        } else {
          console.log("Received no valid origin option data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving origin options");
        console.log(error);
        reject(error);
      });
  });
};

const checkStatus = res => {
  if (res.ok) {
    // res.status >= 200 && res.status < 300
    return res;
  } else {
    throw res.statusText;
  }
};

const getRawCharacter = (characterId) => {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving character id ${characterId}`);

    const headers = {};
    const characterUrl = CONFIG.urls.characterUrl(characterId);
    fetch(characterUrl, headers)
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        if (isValidData(json)) {
          resolve(json);
        } else {
          reject(json.message);
        }
      })
      .catch(error => {
        console.log(`loadCharacterData(${characterId}): ${error}`);
        reject(error);
      });;
  });
};

const extractCharacterData = (cobaltId, characterId) => {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving character id ${characterId}`);

    const auth = authentication.CACHE_AUTH.exists(cobaltId);
    const headers = (auth) ? { headers: { "Authorization": `Bearer ${auth.data}` } } : {};
    const characterUrl = CONFIG.urls.characterUrl(characterId);
    fetch(characterUrl, headers)
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        if (isValidData(json)) {
          resolve(json.data);
        } else {
          reject(json.message);
        }
      })
      .catch(error => {
        console.log(`loadCharacterData(${characterId}): ${error}`);
        reject(error);
      });
  });
};

const getOptionalClassFeatures = (data, optionIds, campaignId, cobaltId) => {
  const cacheId = authentication.CACHE_AUTH.exists(cobaltId);

  return new Promise((resolve) => {
    if (cacheId) {
      console.log("CLASS Optional Features:");

      extractClassOptions(cobaltId, optionIds, campaignId)
        .then(options => {
          data.classOptions = options;
          resolve(data);
        });
    } else {
      resolve(data);
    }
  });
};

const getOptionalOrigins = (data, optionIds, campaignId, cobaltId) => {
  const cacheId = authentication.CACHE_AUTH.exists(cobaltId);

  return new Promise((resolve) => {
    if (cacheId) {
      console.log("ORIGIN Optional Features:");

      extractRacialTraitsOptions(cobaltId, optionIds, campaignId)
        .then(options => {
          data.originOptions = options;
          resolve(data);
        });
    } else {
      resolve(data);
    }
  });
};


exports.extractClassOptions = extractClassOptions;
exports.getRawCharacter = getRawCharacter;
exports.extractCharacterData = extractCharacterData;
exports.getOptionalClassFeatures = getOptionalClassFeatures;
exports.getOptionalOrigins = getOptionalOrigins;

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const CONFIG = require("./config.js");
const authentication = require("./auth.js");

const filterModifiers = require("./filterModifiers.js");

const spells = require("./spells.js");
const character = require("./character.js");
const items = require("./items.js");
const monsters = require("./monsters.js");
const campaign = require("./campaign.js");

const app = express();
const port = process.env.PORT || 3000;

const authPath = ["/proxy/auth"];
app.options(authPath, cors(), (req, res) => res.status(200).send());
app.post(authPath, cors(), express.json(), (req, res) => {
  if (!req.body.cobalt || req.body.cobalt == "") return res.json({ success: false, message: "No cobalt token" });
  const cacheId = authentication.getCacheId(req.body.cobalt);

  authentication.getBearerToken(cacheId, req.body.cobalt).then((token) => {
    if (!token) return res.json({ success: false, message: "You must supply a valid cobalt value." });
    return res.status(200).json({ success: true, message: "Authenticated." });
  });
});

/**
 * Returns raw json from DDB
 */
app.options("/proxy/items", cors(), (req, res) => res.status(200).send());
app.post("/proxy/items", cors(), express.json(), (req, res) => {
  if (!req.body.cobalt || req.body.cobalt == "") return res.json({ success: false, message: "No cobalt token" });

  const cacheId = authentication.getCacheId(req.body.cobalt);
  const campaignId = req.body.campaignId;

  authentication.getBearerToken(cacheId, req.body.cobalt).then((token) => {
    if (!token) return res.json({ success: false, message: "You must supply a valid cobalt value." });
    items
      .extractItems(cacheId, campaignId)
      .then((data) => {
        return res
          .status(200)
          .json({ success: true, message: "All available items successfully received.", data: data });
      })
      .catch((error) => {
        console.log(error);
        if (error === "Forbidden") {
          return res.json({ success: false, message: "You must supply a valid bearer token." });
        }
        return res.json({ success: false, message: "Unknown error during item loading: " + error });
      });
  });
});

/**
 * Get Class Spells RAW
 */
app.options("/proxy/class/spells", cors(), (req, res) => res.status(200).send());
app.post("/proxy/class/spells", cors(), express.json(), (req, res) => {
  const className = req.body.className ? req.body.className : req.params.className;
  const campaignId = req.body.campaignId;

  const klass = CONFIG.classMap.find((cls) => cls.name == className);
  if (!klass) return res.json({ success: false, message: "Invalid query" });
  if (!req.body.cobalt || req.body.cobalt == "") return res.json({ success: false, message: "No cobalt token" });
  const cobaltToken = req.body.cobalt;

  const cacheId = authentication.getCacheId(cobaltToken);

  const mockClass = [
    {
      characterClassId: cacheId,
      name: klass.name,
      id: klass.id,
      level: 20,
      spellLevelAccess: 20,
      spells: [],
      classId: klass.id,
      subclassId: klass.id,
      characterClass: klass.name,
      characterSubclass: klass.name,
      characterId: cacheId,
      spellType: klass.spells,
      campaignId: campaignId,
    },
  ];

  authentication.getBearerToken(cacheId, cobaltToken).then((token) => {
    if (!token) return res.json({ success: false, message: "You must supply a valid cobalt value." });
    spells
      .loadSpells(mockClass, cacheId, true)
      .then((data) => {
        // console.log(data);
        const rawSpells = data.map((d) => d.spells).flat();
        // const parsedSpells = getSpells(rawSpells);
        // return parsedSpells;
        return rawSpells;
      })
      .then((data) => {
        return res
          .status(200)
          .json({ success: true, message: "All available spells successfully received.", data: data });
      })
      .catch((error) => {
        console.log(error);
        if (error === "Forbidden") {
          return res.json({ success: false, message: "You must supply a valid cobalt value." });
        }
        return res.json({ success: false, message: "Unknown error during spell loading: " + error });
      });
  });
});

/**
 * Attempt to parse the character remotely
 */
app.options(["/proxy/character","/proxy/v5/character"], cors(), (req, res) => res.status(200).send());
app.post(["/proxy/character","/proxy/v5/character"], cors(), express.json(), (req, res) => {
  // check for cobalt token
  const cobalt = req.body.cobalt;

  let characterId = 0;
  try {
    const characterIdString = req.body.characterId ? req.body.characterId : req.params.characterId;
    characterId = parseInt(characterIdString);
  } catch (exception) {
    return res.json({ message: "Invalid query" });
  }

  const updateId = req.body.updateId ? req.body.updateId : 0;
  const cobaltId = `${characterId}${cobalt}`;

  authentication.getBearerToken(cobaltId, cobalt).then(() => {
    character
      .extractCharacterData(cobaltId, characterId, updateId) // this caches
      .then((data) => {
        console.log(`Name: ${data.name}, URL: ${CONFIG.urls.baseUrl}/character/${data.id}`);
        return Promise.resolve(data);
      })
      .then((result) => {
        if (cobalt) {
          const campaignId =
            result.campaign && result.campaign.id && result.campaign.id !== "" ? result.campaign.id : null;
          const optionIds = result.optionalClassFeatures.map((opt) => opt.classFeatureId);
          return character.getOptionalClassFeatures(result, optionIds, campaignId, cobaltId);
        } else {
          return result;
        }
      })
      .then((result) => {
        if (cobalt) {
          const campaignId =
            result.campaign && result.campaign.id && result.campaign.id !== "" ? result.campaign.id : null;
          const optionIds = result.optionalOrigins.map((opt) => opt.racialTraitId);
          return character.getOptionalOrigins(result, optionIds, campaignId, cobaltId);
        } else {
          return result;
        }
      })
      .then((result) => {
        const spellListIds = result.classOptions
          ? result.classOptions
            .filter((option) => option.spellListIds)
            .map((option) => option.spellListIds)
            .flat()
          : [];
        return spells.getSpellAdditions(result, spellListIds, cobaltId);
      })
      .then((data) => {
        data = filterModifiers(data);
        return { success: true, messages: ["Character successfully received."], ddb: data };
      })
      .then((data) => {
        return res.status(200).json(data);
      })
      .catch((error) => {
        console.log(error);
        if (error === "Forbidden") {
          return res.json({ success: false, message: "Character must be set to public in order to be accessible." });
        }
        return res.json({ success: false, message: "Unknown error during character parsing: " + error });
      });
  });
});

/**
 * Return RAW monster data from DDB
 */
const getMonsterProxyRoutes = ["/proxy/monster", "/proxy/monsters"];
app.options(getMonsterProxyRoutes, cors(), (req, res) => res.status(200).send());
app.post(getMonsterProxyRoutes, cors(), express.json(), (req, res) => {
  // check for cobalt token
  const cobalt = req.body.cobalt;
  if (!cobalt || cobalt == "") return res.json({ success: false, message: "No cobalt token" });

  const search = req.body.search ? req.body.search : req.params.search;
  const searchTerm = req.body.searchTerm ? req.body.searchTerm : req.params.searchTerm;

  const homebrew = req.body.homebrew ? req.body.homebrew : false;
  const homebrewOnly = req.body.homebrewOnly ? req.body.homebrewOnly : false;

  const exactNameMatch = req.body.exactMatch || false;
  const performExactMatch = exactNameMatch && searchTerm && searchTerm !== "";

  const sources = req.body.sources || [];
  console.log(sources);

  const hash = crypto.createHash("sha256");
  hash.update(cobalt + searchTerm);

  const cacheId = hash.digest("hex");

  authentication.getBearerToken(cacheId, cobalt).then((token) => {
    if (!token) return res.json({ success: false, message: "You must supply a valid cobalt value." });

    monsters
      .extractMonsters(cacheId, searchTerm, homebrew, homebrewOnly, sources)
      .then((data) => {
        if (performExactMatch) {
          const filteredMonsters = data.filter((monster) => monster.name.toLowerCase() === search.toLowerCase());
          return filteredMonsters;
        } else {
          return data;
        }
      })
      .then((data) => {
        return res
          .status(200)
          .json({ success: true, message: "All available monsters successfully received.", data: data });
      })
      .catch((error) => {
        console.log(error);
        if (error === "Forbidden") {
          return res.json({ success: false, message: "You must supply a valid cobalt value." });
        }
        return res.json({ success: false, message: "Unknown error during monster loading: " + error });
      });
  });
});

app.options("/proxy/campaigns", cors(), (req, res) => res.status(200).send());
app.post("/proxy/campaigns", cors(), express.json(), (req, res) => {
  if (!req.body.cobalt || req.body.cobalt == "") return res.json({ success: false, message: "No cobalt token" });

  const cacheId = authentication.getCacheId(req.body.cobalt);

  authentication.getBearerToken(cacheId, req.body.cobalt).then((token) => {
    if (!token) return res.json({ success: false, message: "You must supply a valid cobalt value." });
    campaign
      .getCampaigns(cacheId)
      .then((data) => {
        return res
          .status(200)
          .json({ success: true, message: "All available campaigns successfully received.", data: data });
      })
      .catch((error) => {
        console.log(error);
        if (error === "Forbidden") {
          return res.json({ success: false, message: "You must supply a valid bearer token." });
        }
        return res.json({ success: false, message: "Unknown error during campaign get: " + error });
      });
  });
});

app.listen(port, () => {
  console.log(`DDB Proxy started on :${port}`);
});

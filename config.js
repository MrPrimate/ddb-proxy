/**
 * CONFIG
 */

const CLASS_MAP = [
  { name: "Barbarian", spells: "SPELLS", id: 9 },
  { name: "Bard", spells: "SPELLS", id: 1 },
  { name: "Cleric", spells: "KNOWN", id: 2 },
  { name: "Druid", spells: "KNOWN", id: 3 },
  { name: "Fighter", spells: "SPELLS", id: 10 },
  { name: "Monk", spells: "SPELLS", id: 11 },
  { name: "Paladin", spells: "KNOWN", id: 4 },
  { name: "Ranger", spells: "SPELLS", id: 5 },
  { name: "Rogue", spells: "SPELLS", id: 12 },
  { name: "Sorcerer", spells: "SPELLS", id: 6 },
  { name: "Warlock", spells: "SPELLS", id: 7 },
  { name: "Wizard", spells: "SPELLS", id: 8 },
  { name: "Artificer", spells: "KNOWN", id: 252717 },
  { name: "Blood Hunter", spells: "SPELLS", id: 357975 },
  { name: "Graviturgy", spells: "SPELLS", id: 400661 },
  { name: "Chronurgy", spells: "SPELLS", id: 400659 },
];

const BAD_IMAGES = [
];

const CONFIG = {
  badImages: BAD_IMAGES,
  classMap: CLASS_MAP,
  urls: {
    authService: "https://auth-service.dndbeyond.com/v1/cobalt-token",
    baseUrl: "https://character-service.dndbeyond.com/character/v5",
    characterUrl: (characterId) =>
      `${CONFIG.urls.baseUrl}/character/${characterId}`,
    spellsAPI: (classId, classLevel, campaignId) => {
      let campaign = "";
      if (campaignId) campaign = `&campaignId=${campaignId}`;
      return `${CONFIG.urls.baseUrl}/game-data/spells?classId=${classId}&classLevel=${classLevel}&sharingSetting=2${campaign}`;
    },
    alwaysPreparedSpells: (classId, classLevel, campaignId, spellListIds=[]) => {
      let campaign = "";
      let spellLists = "";
      spellListIds.forEach(list => spellLists += `&spellListIds[]=${list}`);
      if (campaignId) campaign = `&campaignId=${campaignId}`;
      return `${CONFIG.urls.baseUrl}/game-data/always-prepared-spells?classId=${classId}&classLevel=${classLevel}&sharingSetting=2${campaign}${spellLists}`;
    },
    alwaysKnownSpells: (classId, classLevel, campaignId, spellListIds=[]) => {
      let campaign = "";
      let spellLists = "";
      spellListIds.forEach(list => spellLists += `&spellListIds[]=${list}`);
      if (campaignId) campaign = `&campaignId=${campaignId}`;
      return `${CONFIG.urls.baseUrl}/game-data/always-known-spells?classId=${classId}&classLevel=${classLevel}&sharingSetting=2${campaign}${spellLists}`;
    },
    itemsAPI: (campaignId) => {
      let campaign = "";
      if (campaignId) campaign = `&campaignId=${campaignId}`;
      return `${CONFIG.urls.baseUrl}/game-data/items?sharingSetting=2${campaign}`;
    },
    vehiclesAPI: (campaignId) => {
      let campaign = "";
      if (campaignId) campaign = `&campaignId=${campaignId}`;
      return `${CONFIG.urls.baseUrl}/game-data/vehicles?sharingSetting=2${campaign}`;
    },
    classesAPI: (campaignId) => {
      let campaign = "";
      if (campaignId) campaign = `&campaignId=${campaignId}`;
      return `${CONFIG.urls.baseUrl}/game-data/classes?sharingSetting=2${campaign}`;
    },
    featsAPI: (campaignId) => {
      let campaign = "";
      if (campaignId) campaign = `&campaignId=${campaignId}`;
      return `${CONFIG.urls.baseUrl}/game-data/feats?sharingSetting=2${campaign}`;
    },
    racesAPI: (campaignId) => {
      let campaign = "";
      if (campaignId) campaign = `&campaignId=${campaignId}`;
      return `${CONFIG.urls.baseUrl}/game-data/races?sharingSetting=2${campaign}`;
    },
    monstersAPI: (skip, take, search="", homebrew=false, homebrewOnly=false, sources=[]) => {
      let sourceSearch = sources.reduce((previous, current) => previous + `&sources=${current}`, "");
      let useHomebrew = (homebrew) ? "" : "&showHomebrew=f";
      if (homebrewOnly) {
        sourceSearch = "";
        useHomebrew = "&showHomebrew=t";
      }
      const url = `https://monster-service.dndbeyond.com/v1/Monster?search=${search}&skip=${skip}&take=${take}${useHomebrew}${sourceSearch}`;
      console.log(url);
      return url;
    },
    classOptionsAPI: () => {
      return `${CONFIG.urls.baseUrl}/game-data/class-feature/collection`;
    },
    racialTraitOptionsAPI: () => {
      return `${CONFIG.urls.baseUrl}/game-data/racial-trait/collection`;
    },
    campaignsAPI: "https://www.dndbeyond.com/api/campaign/active-campaigns",
  },

};

module.exports = CONFIG;

const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");

const isValidData = data => {
  return data.success === true;
};

const removeCantrips = data => {
  const filteredSpellList = data.filter(spell => {
    return spell.definition.level > 0;
  });
  return filteredSpellList;
};

const filterByLevel = (data, spellLevelAccess) => {
  const filteredSpellList = data.filter(spell => {
    return spell.definition.level <= spellLevelAccess;
  });
  return filteredSpellList;
};



const extractSpells = (classInfo, cobaltId) => {
  return new Promise((resolve, reject) => {
    const { name, id, spellLevelAccess } = classInfo;

    console.log(`Retrieving all spells for ${name} ${cobaltId} (${id}) at spell level ${spellLevelAccess}`);

    const url = CONFIG.urls.spellsAPI(id, 20, classInfo.campaignId);
    const headers = (authentication.CACHE_AUTH.exists(cobaltId).data !== null) ? {headers: {"Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`}} : {};
    fetch(url, headers)
      .then(res => res.json())
      .then(json => {
        // console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidData(json)) {
          const filteredSpells = filterByLevel(json.data, spellLevelAccess).filter(item => {
            if (item.definition.sources && item.definition.sources.some((source) => source.sourceId === 39)) {
              return false;
            } else {
              return true;
            }
          });
          console.log(
            `Adding ${filteredSpells.length} of ${json.data.length} spells available to a lvl${spellLevelAccess} ${classInfo.name} caster...`
          );
          resolve(filteredSpells);
        } else {
          console.log("Received no valid spell data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving spells");
        console.log(error);
        reject(error);
      });
  });
};

const extractAlwaysPreparedSpells = (classInfo, spellListIds=[]) => {
  return new Promise((resolve, reject) => {
    const { name, id, spellLevelAccess } = classInfo;
    console.log(`Retrieving always prepared spells for ${name} (${id}) at spell level ${spellLevelAccess}`);

    const url = CONFIG.urls.alwaysPreparedSpells(id, 20, classInfo.campaignId, spellListIds);
    fetch(url)
      .then(res => res.json())
      .then(json => {
        // console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidData(json)) {
          const filteredSpells = filterByLevel(json.data, spellLevelAccess).filter(item => {
            if (item.definition.sources && item.definition.sources.some((source) => source.sourceId === 39)) {
              return false;
            } else {
              return true;
            }
          });
          console.log(
            `Adding ${filteredSpells.length} of ${json.data.length} allways prepared spells available to a lvl${spellLevelAccess} ${classInfo.name} caster...`
          );
          resolve(filteredSpells);
        } else {
          console.log("Received no valid spell data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving spells");
        console.log(error);
        reject(error);
      });
  });
};

const extractAlwaysKnownSpells = (classInfo, cobaltId, cantrips, spellListIds=[]) => {
  console.log(`SPELL IDS ${spellListIds}`);
  return new Promise((resolve, reject) => {
    const { name, id, spellLevelAccess } = classInfo;
    console.log(`Retrieving all known spells for ${name} (${id}) at spell level ${spellLevelAccess}`);

    const url = CONFIG.urls.alwaysKnownSpells(id, 20, classInfo.campaignId, spellListIds);
    console.log(url);
    // console.log(`Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`);
    const headers = (authentication.CACHE_AUTH.exists(cobaltId).data !== null) ? {headers: {"Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`}} : {};
    fetch(url, headers)
      .then(res => res.json())
      .then(json => {
        // console.log(json.data.map(sp => sp.definition.name).join(", "));
        if (isValidData(json)) {
          const noCantripSpells = (cantrips) ? json.data : removeCantrips(json.data);
          const filteredSpells = filterByLevel(noCantripSpells, spellLevelAccess).filter(item => {
            if (item.definition.sources && item.definition.sources.some((source) => source.sourceId === 39)) {
              return false;
            } else {
              return true;
            }
          });
          console.log(
            `Adding ${filteredSpells.length} of ${json.data.length} always known spells available to a lvl${spellLevelAccess} ${classInfo.name} caster...`
          );
          resolve(filteredSpells);
        } else {
          console.log("Received no valid spell data, instead:" + json.message);
          reject(json.message);
        }
      })
      .catch(error => {
        console.log("Error retrieving spells");
        console.log(error);
        reject(error);
      });
  });
};

const extractCasterLevel = (cls, isMultiClassing) => {
  let casterLevel = 0;
  if (isMultiClassing) {
    // get the casting level if the character is a multiclassed spellcaster
    if (cls.definition.spellRules && cls.definition.spellRules.multiClassSpellSlotDivisor) {
      casterLevel = Math.floor(cls.level / cls.definition.spellRules.multiClassSpellSlotDivisor);
    }
  } else {
    casterLevel = cls.level;
  }

  return casterLevel;
};

const extractSpellLevelAccess = (cls, casterLevel) => {
  const spellSlots = cls.definition.spellRules.levelSpellSlots[casterLevel];
  const spellLevelAccess = spellSlots.reduce((count, numSpellSlots) => (numSpellSlots > 0 ? count + 1 : count), 0);
  return spellLevelAccess;
};


const extractClassIds = data => {
  const isMultiClassing = data.classes.length > 1;
  return data.classes.map(characterClass => {
    return {
      characterClassId: characterClass.id,
      name:
        characterClass.subclassDefinition && characterClass.subclassDefinition.name
          ? characterClass.definition.name + ` (${characterClass.subclassDefinition.name})`
          : characterClass.definition.name,
      id:
        characterClass.subclassDefinition && characterClass.subclassDefinition.id
          ? characterClass.subclassDefinition.id
          : characterClass.definition.id,
      level: extractCasterLevel(characterClass, isMultiClassing),
      spellLevelAccess: extractSpellLevelAccess(characterClass, extractCasterLevel(characterClass)),
      spells: [],
      classId: characterClass.definition.id,
      subclassId: characterClass.subclassDefinition ? characterClass.subclassDefinition.id : null,
      characterClass: characterClass.definition.name,
      characterSubclass: characterClass.subclassDefinition ? characterClass.subclassDefinition.name : null,
      characterId: data.id,
      campaignId: (data.campaign) ? data.campaign.id : null,
    };
  });
};

const loadSpellAdditions = (classInfo, cobaltId, spellListIds) => {
  const cobaltToken = authentication.CACHE_AUTH.exists(cobaltId);
  return new Promise((resolve, reject) => {
    Promise.allSettled(classInfo.map(info => {
      const knowSpellsClasses = ["Druid", "Cleric", "Paladin", "Artificer"];
      if (cobaltToken && knowSpellsClasses.includes(info.characterClass)) {
        console.log("[ ALWAYS KNOWN SPELLS =========================================== ]");
        return extractAlwaysKnownSpells(info, cobaltId, true, spellListIds);
      } else {
        console.log("[ ALWAYS PREPARED SPELLS ======================================== ]");
        return extractAlwaysPreparedSpells(info, spellListIds);
      }
    }))
      .then(results => {
        // combining all resolved results
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            classInfo[index].spells = result.value;
          }
        });
        resolve(classInfo);
      })
      .catch(error => reject(error));
  });
};

const loadSpells = (classInfo, cobaltToken, cantrips) => {
  return new Promise((resolve, reject) => {
    Promise.allSettled(classInfo.map(info => {
      if (info.spellType == "KNOWN") {
        console.log("[ ALWAYS KNOWN SPELLS =========================================== ]");
        const knownSpells = extractAlwaysKnownSpells(info, cobaltToken, cantrips);
        const otherSpells = extractSpells(info, cobaltToken); // for cantrips etc
        return Promise.all([knownSpells, otherSpells]);
      } else if (info.spellType == "SPELLS") {
        console.log("[ ALL SPELLS ==================================================== ]");
        const otherSpells = extractSpells(info, cobaltToken);
        return Promise.all([otherSpells]);
      }
    }))
      .then(results => {
        // combining all resolved results
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            classInfo[index].spells = result.value.flat();
          }
        });
        resolve(classInfo);
      })
      .catch(error => reject(error));
  });
};

function getSpellAdditions(data, spellListIds, cacheId) {
  return new Promise((resolve) => {
    const classInfo = extractClassIds(data.character);
    console.log("CLASS INFORMATION FOR SPELL ADDITIONS:");
    console.log(classInfo);

    loadSpellAdditions(classInfo, cacheId, spellListIds).then(classInfo => {
      // add the always prepared spells to the class' spell list
      data.character.classSpells = data.character.classSpells.map(classSpells => {
        // find always prepared spells in the results
        const additionalSpells = classInfo.find(
          classInfo => classInfo.characterClassId === classSpells.characterClassId
        );

        if (additionalSpells) {
          additionalSpells.spells.forEach(spell => {
            console.log("Adding spells to character...");
            console.log(" + Adding spell to character: " + spell.definition.name);
            classSpells.spells.push(spell);
          });
        }
        return classSpells;
      });
      console.log("******** ADDITIONAL SPELL LOAD FINISHED ***********");
      resolve(data);
    });
  });
}

function filterHomebrew(data, includeHomebrew) {
  if (includeHomebrew) {
    return data;
  } else {
    data.character.classSpells = data.character.classSpells.map((classSpells) => {
      classSpells.spells = classSpells.spells.filter(spell => !spell.definition.isHomebrew);
      return classSpells;
    });
    data.character.spells.class = data.character.spells.class.filter(spell => !spell.definition || !spell.definition.isHomebrew);
    data.character.spells.race = data.character.spells.race.filter(spell => !spell.definition || !spell.definition.isHomebrew);
    data.character.spells.feat = data.character.spells.feat.filter(spell => !spell.definition || !spell.definition.isHomebrew);
    data.character.spells.item = data.character.spells.item.filter(spell => !spell.definition || !spell.definition.isHomebrew);
    return data;
  }
}


exports.loadSpells = loadSpells;
exports.getSpellAdditions = getSpellAdditions;
exports.filterHomebrew = filterHomebrew;

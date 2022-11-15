const fetch = require("node-fetch");
const CONFIG = require("./config.js");
const authentication = require("./auth.js");

function getMonsterCount(cobaltId, searchTerm="", homebrew, homebrewOnly, sources) {
  return new Promise((resolve, reject) => {
    const headers = (authentication.CACHE_AUTH.exists(cobaltId).data !== null) ? {headers: {"Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`}} : {};
    const url = CONFIG.urls.monstersAPI(0,1, searchTerm, homebrew, homebrewOnly, sources);
    fetch(url, headers)
      .then(res => res.json())
      .then(json => {
        resolve(json.pagination.total);
      })
      .catch(error => {
        console.log("Error retrieving monsters");
        console.log(error);
        reject(error);
      });
  });

}

function imageFiddleMonsters(monsters) {
  const imageFiddledMonsters = monsters.map((monster) => {
    const imageResizeRegEx = /\/thumbnails\/(\d*)\/(\d*)\/(\d*)\/(\d*)\/(\d*)\.(jpg|png|jpeg|webp|gif)/;
    if (monster.largeAvatarUrl) {
      const original = monster.largeAvatarUrl.replace(".com.com/", ".com/");
      monster.largeAvatarUrl = original.replace(imageResizeRegEx, "/thumbnails/$1/$2/1000/1000/$5.$6");
    }
    if (monster.basicAvatarUrl) {
      const original = monster.basicAvatarUrl.replace(".com.com/", ".com/");
      monster.basicAvatarUrl = original.replace(imageResizeRegEx, "/thumbnails/$1/$2/1000/1000/$5.$6");
    }
    return monster;
  });
  return imageFiddledMonsters;
}

const extractMonsters = (cobaltId, searchTerm="", homebrew, homebrewOnly, sources) => {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving monsters for ${cobaltId}`);

    let monsters = [];
    const headers = (authentication.CACHE_AUTH.exists(cobaltId).data !== null) ? {headers: {"Authorization": `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}`}} : {};
    let count = 0;
    // fetch 100 monsters at a time - api limit
    let take = 100;
    getMonsterCount(cobaltId, searchTerm, homebrew, homebrewOnly, sources).then(async (total) => {
      console.log(`Total monsters ${total}`);
      const hardTotal = total;
      while (total >= count && hardTotal >= count) {
        console.log(`Fetching monsters ${count}`);
        const url = CONFIG.urls.monstersAPI(count,take,searchTerm, homebrew, homebrewOnly, sources);
        await fetch(url, headers)
          .then(res => res.json())
          .then(json => {
            const availableMonsters = json.data.filter((monster) => {
              const isHomebrew = (homebrew) ? monster.isHomebrew === true : false;
              const available = monster.isReleased === true || isHomebrew;
              return available;
            });
            const imageFiddledMonsters = imageFiddleMonsters(availableMonsters);
            monsters.push(...imageFiddledMonsters);
          })
          .catch(error => {
            console.log(`Error retrieving monsters at ${count}`);
            console.log(error);
            reject(error);
          });
        count += take;
      }
      return monsters;
    }).then((data) => {
      console.log(`Monster count: ${data.length}.`);
      resolve(data);
    }).catch(error => {
      console.log("Error retrieving monsters");
      console.log(error);
      reject(error);
    });
  });
};


async function getIdCount(ids) {
  return new Promise((resolve) => {
    resolve(ids.length);
  });
}

function extractMonstersById (cobaltId, ids) {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving monsters for ${cobaltId} and ${ids}`);

    let monsters = [];
    let count = 0;
    let take = 100;

    getIdCount(ids).then(async (total) => {
      const hardTotal = total;
      while (total >= count && hardTotal >= count) {
        const idSelection = ids.slice(count, count + take);
        const headers
          = authentication.CACHE_AUTH.exists(cobaltId).data !== null
            ? { headers: { Authorization: `Bearer ${authentication.CACHE_AUTH.exists(cobaltId).data}` } }
            : {};
        const url = CONFIG.urls.monsterIdsAPI(idSelection);
        await fetch(url, headers)
          .then((res) => res.json())
          .then((json) => {
            // console.log(json.data);
            const availableMonsters = json.data.filter((monster) => monster.isReleased === true || monster.isHomebrew);
            const imageFiddledMonsters = imageFiddleMonsters(availableMonsters);
            monsters.push(...imageFiddledMonsters);
          })
          .catch((error) => {
            console.log("Error retrieving monsters by id");
            console.log(error);
            reject(error);
          });
        count += take;
      }
      return monsters;
    }).then((data) => {
      console.log(`Monster count: ${data.length}.`);
      resolve(data);
    });

  });
}

exports.extractMonsters = extractMonsters;
exports.extractMonstersById = extractMonstersById;

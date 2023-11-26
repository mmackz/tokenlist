import fs from "fs";
import path from "path";
import {
   minVersionBump,
   nextVersion,
   isVersionUpdate,
} from "@uniswap/token-lists";
import { fileURLToPath } from "url";

export function getTokenListsFromFiles() {
   const __dirname = path.dirname(fileURLToPath(import.meta.url));
   const tokenListFilenames = ["tokenlist.json", "oldversion.json"];
   const tokenLists = [];
   for (const filename of tokenListFilenames) {
      try {
         const filePath = path.join(__dirname, "../../", filename);
         const rawData = fs.readFileSync(filePath, "utf8");
         const tokenList = JSON.parse(rawData);
         tokenLists.push(tokenList);
      } catch {
         if (filename === "tokenlist.json") {
            throw new Error("error reading tokenlist.json file");
         }
      }
   }
   return tokenLists;
}

export async function getTokenListFromGit() {
   const git = simpleGit();
   try {
      const fileContent = await git.show(["main:tokenlist.json"]);
      const tokenList = JSON.parse(fileContent);
      if (validate(tokenList)) {
         return JSON.parse(fileContent);
      }
      throw new Error("previous token list is not valid");
   } catch (error) {
      console.error("Error fetching token list from Git:", error);
      throw error;
   }
}

export function getNextVersion(base, update) {
   const currentVersion = base.version;
   const expectedVersionBump = minVersionBump(base.tokens, update.tokens);
   return nextVersion(currentVersion, expectedVersionBump);
}

export function getUpdatedVersion(base, update) {
   const updatedVersion = getNextVersion(base, update);
   if (isVersionUpdate(base.version, updatedVersion)) {
      return updatedVersion
   } 
   return base.version
}

export function getTimestamp() {
   return new Date().toISOString()
}

export function cloneDeep(obj) {
   if (obj === null || typeof obj !== "object") {
      return obj;
   }
   if (Array.isArray(obj)) {
      return obj.reduce((arr, item, i) => {
         arr[i] = cloneDeep(item);
         return arr;
      }, []);
   }
   if (obj instanceof Object) {
      const clonedObj = {};
      for (const key in obj) {
         if (Object.hasOwn(obj, key)) {
            clonedObj[key] = cloneDeep(obj[key]);
         }
      }
      return clonedObj;
   }
   throw new Error("Unable to copy object. Its type is not supported.");
}

export const chainIdMap = {
   1: "ethereum",
   10: "optimistic-ethereum",
   42161: "arbitrum-one",
   137: "polygon-pos",
   8453: "base",
   324: "zksync",
   56: "binance-smart-chain",
   43114: "avalanche",
   42220: "celo"
};

export function sleep(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

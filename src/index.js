import {
   diffTokenLists,
   minVersionBump,
   isVersionUpdate,
   nextVersion
} from "@uniswap/token-lists";
import axios from "axios";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chainIdMap, sleep, schema } from "../utils/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Reading and parsing the JSON file
const filePath = path.join(__dirname, "tokenlist.json");
const rawData = fs.readFileSync(filePath, "utf8");
const tokenList = JSON.parse(rawData);

// Read the old token list
const oldFilePath = path.join(__dirname, "oldversion.json");
const oldRawData = fs.readFileSync(oldFilePath, "utf8");
const oldTokenList = JSON.parse(oldRawData);

export async function validateTokenAddresses() {
   const diff = diffTokenLists(oldTokenList.tokens, tokenList.tokens);
   if (diff.added) {
      let idx = 0;
      console.log(diff.added);
      for (const token of diff.added) {
         try {
            const { chainId, address, decimals } = token;
            const networkId = chainIdMap[chainId];
            const res = await axios.get(
               `https://api.coingecko.com/api/v3/coins/${networkId}/contract/${address}`
            );

            const { decimal_place, contract_address } =
               res.data.detail_platforms[networkId];
            if (contract_address === address.toLowerCase()) {
               console.log(res.data.id, "address is valid");
            } else {
               throw new Error("address is invalid");
            }
            if (decimal_place === decimals) {
               console.log(res.data.id, "decimals are valid");
            } else {
               throw new Error("decimals is incorrect");
            }
            if (diff.added.length - idx > 1) {
               await sleep(6000);
            }
         } catch (error) {
            if (error.response) {
               console.log(token.name, error.response.data);
            }
            else {
               console.log(error.message);
               console.log("an error has occurred..");
            }
            return false;
         }
      }
      return true;
   }
}

export async function bumpVersion() {
   const currentVersion = oldTokenList.version;
   console.log("current ver.:", currentVersion);
   const expectedVersionBump = minVersionBump(oldTokenList.tokens, tokenList.tokens);
   const newVersion = nextVersion(currentVersion, expectedVersionBump);
   console.log("new:", newVersion);
   if (isVersionUpdate(currentVersion, newVersion)) {
      console.log("Version bump detected!");
      tokenList.version = newVersion;
      fs.writeFileSync(filePath, JSON.stringify(tokenList, null, 2));
   } else {
      console.log("No version bump detected.");
   }
}

export async function validate() {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  const validator = ajv.compile(schema);
  const filePath = path.join(__dirname, "tokenlist.json"); 
  const rawData = fs.readFileSync(filePath, "utf8"); 
  const tokenList = JSON.parse(rawData); 

  const valid = validator(tokenList);
  if (valid) {
     return valid;
  }
  if (validator.errors) {
     throw validator.errors.map((error) => {
        delete error.data;
        return error;
     });
  }
}

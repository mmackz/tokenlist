import { expect } from "chai";
import { validate, validateTokenAddresses } from "../src/index.js";
import { versionComparator } from "@uniswap/token-lists";
import {
   getTokenListsFromFiles,
   getTokenListFromGit,
   getNextVersion
} from "../src/utils/index.js";

describe("Live Data", async () => {
   const [currentTokenList, previousTokenList] = getTokenListsFromFiles();
   const previousList = previousTokenList ?? (await getTokenListFromGit());
   describe("Token List Tests", async () => {
      describe("when using current tokenlist.json", () => {
         it("it will pass validation", async () => {
            const isValid = await validate(currentTokenList);
            expect(isValid).to.be.true;
         });
      });

      if (previousTokenList !== undefined) {
         describe("when using previous version of tokenlist", () => {
            it("it will pass validation", async () => {
               const isValid = await validate(previousTokenList);
               expect(isValid).to.be.true;
            });
         });
      }
   });

   describe("Token validation tests", async () => {
      it("should pass token validation if new tokens are added", async () => {
         const isValid = await validateTokenAddresses(previousList, currentTokenList);
         expect(isValid).to.be.true;
      });
   });

   describe("MetaData Tests", () => {
      it("version is correct based on any changes made", async () => {
         const newVersion = getNextVersion(previousTokenList, currentTokenList);
         expect(
            versionComparator(newVersion, currentTokenList.version),
            "Version number is not correct. To fix this, run 'npm start' to generate metadata changes"
         ).to.equal(0);
      });
   });
});

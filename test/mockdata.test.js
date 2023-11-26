import { expect } from "chai";
import { getVersionUpgrade, VersionUpgrade } from "@uniswap/token-lists";
import { validate, validateTokenAddresses } from "../src/index.js";
import { mockTokenList, mockToken } from "./data/mockdata.js";
import { cloneDeep, getNextVersion, getTimestamp } from "../src/utils/index.js";

describe("Mock Data", () => {
   describe("Token List Tests", () => {
      describe("when using mock token list", () => {
         it("validation passes when format is valid", async () => {
            const isValid = await validate(mockTokenList);
            expect(isValid).to.be.true;
         });
         it("validation fails when additional properties are detected", async () => {
            const tokenList = cloneDeep(mockTokenList);
            tokenList.foo = "bar";
            try {
               await validate(tokenList);
               throw new Error("Expected an error but did not get one");
            } catch (err) {
               expect(err).to.equal("must NOT have additional properties");
            }
         });
         it("validation fails when token addresses are not in correct format", async () => {
            const tokenList = cloneDeep(mockTokenList);
            tokenList.tokens[0].address = "bar";
            try {
               await validate(tokenList);
               throw new Error("Expected an error but did not get one");
            } catch (err) {
               expect(err).to.equal(`must match pattern "^0x[a-fA-F0-9]{40}$"`);
            }
         });
      });
   });

   describe("Token Validation Tests", () => {
      describe("when using mock data", () => {
         describe("tests should pass when valid token is added", () => {
            it("valid token address passes validation", async () => {
               const tokenListClone = cloneDeep(mockTokenList);
               tokenListClone.tokens.push(mockToken);
               const isValid = await validateTokenAddresses(mockTokenList, tokenListClone);
               expect(isValid).to.be.true;
            });
         });

         describe("tests should fail when added tokens have invalid inputs", () => {
            let originalConsoleLog;
            let originalConsoleError;
            before(() => {
               originalConsoleLog = console.log;
               originalConsoleError = console.error;
               console.log = () => {};
               console.error = () => {};
            });
            after(() => {
               console.log = originalConsoleLog;
               console.error = originalConsoleError;
            });
            it("invalid token address fails validation", async () => {
               const tokenListClone = cloneDeep(mockTokenList);
               const mockTokenClone = cloneDeep(mockToken);
               mockTokenClone.address = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
               tokenListClone.tokens.push(mockTokenClone);
               const isValid = await validateTokenAddresses(mockTokenList, tokenListClone);
               expect(isValid).to.be.false;
            });
            it("invalid decimals fails validation", async () => {
               const tokenListClone = cloneDeep(mockTokenList);
               const mockTokenClone = cloneDeep(mockToken);
               mockTokenClone.decimals = 6;
               tokenListClone.tokens.push(mockTokenClone);
               const isValid = await validateTokenAddresses(mockTokenList, tokenListClone);
               expect(isValid).to.be.false;
            });
         });
      });
   });

   describe("MetaData Tests", () => {
      it("major version upgrade is recommended when removing tokens", async () => {
         const tokenList = cloneDeep(mockTokenList);
         tokenList.tokens.push(mockToken);
         const newVersion = getNextVersion(tokenList, mockTokenList);
         const upgrade = getVersionUpgrade(tokenList.version, newVersion);
         expect(upgrade === VersionUpgrade.MAJOR).to.be.true;
      });

      it("minor version upgrade is recommended when adding tokens", async () => {
         const tokenList = cloneDeep(mockTokenList);
         tokenList.tokens.push(mockToken);
         const newVersion = getNextVersion(mockTokenList, tokenList);
         const upgrade = getVersionUpgrade(mockTokenList.version, newVersion);
         expect(upgrade === VersionUpgrade.MINOR).to.be.true;
      });

      it("patch version upgrade is recommended when editing existing tokens", async () => {
         const tokenList = cloneDeep(mockTokenList);
         tokenList.tokens[0].symbol = "GM";
         const newVersion = getNextVersion(mockTokenList, tokenList);
         const upgrade = getVersionUpgrade(mockTokenList.version, newVersion);
         expect(upgrade === VersionUpgrade.PATCH).to.be.true;
      });

      it("no version upgrade is recommended when list has not changed", async () => {
         const tokenList = cloneDeep(mockTokenList);
         const newVersion = getNextVersion(mockTokenList, tokenList);
         const upgrade = getVersionUpgrade(mockTokenList.version, newVersion);
         expect(upgrade === VersionUpgrade.NONE).to.be.true;
      });

      it("timestamp is in correct format", () => {
         const timestamp = getTimestamp();
         const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
         expect(iso8601Regex.test(timestamp)).to.be.true;
      });
   });
});

import { schema } from "./schema.js";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "fs"; // File System module
import path from "path"; // Path module
import { fileURLToPath } from "url"; // URL module

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Getting __dirname equivalent in ES6 module

async function validate() {
   const ajv = new Ajv({ allErrors: true, verbose: true });
   addFormats(ajv);
   const validator = ajv.compile(schema);

   // Reading and parsing the JSON file
   const filePath = path.join(__dirname, "tokenlist.json"); // Getting the path of the JSON file
   const rawData = fs.readFileSync(filePath, "utf8"); // Reading the file
   const tokenList = JSON.parse(rawData); // Parsing the JSON data
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

validate()
   .then(() => console.log("Valid List."))
   .catch(console.error);

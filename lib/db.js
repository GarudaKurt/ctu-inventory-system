import Database from "better-sqlite3";
import path from "path";

// Path to your SQLite file
const dbPath = path.resolve("./database/inventory.db");
export const db = new Database(dbPath, { verbose: console.log });

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'antigravity.db');
const db = new Database(dbPath);

const info = db.prepare("DELETE FROM predictions WHERE race_name = ?").run('Verified Stakes');

console.log(`Deleted ${info.changes} row(s).`);

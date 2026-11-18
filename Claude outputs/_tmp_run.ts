import Database from "better-sqlite3";
function fixDriverForeignKeys(db: Database.Database) {
  for (const table of ["deliveries", "expenses"]) {
    const fks = db.prepare(`PRAGMA foreign_key_list(${table})`).all() as {
      table: string;
      from: string;
    }[];
    if (!fks.some((fk) => fk.from === "driver_id" && fk.table === "drivers")) continue;

    const row = db
      .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get(table) as { sql: string };
    const tmp = `${table}__new`;
    const newSql = row.sql
      .replace(/CREATE TABLE\s+"?\w+"?/i, `CREATE TABLE ${tmp}`)
      .replace(/REFERENCES\s+"?drivers"?\s*\(\s*"?id"?\s*\)/gi, "REFERENCES users(id)");

    const hasDrivers = db
      .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'drivers'")
      .get();

    db.transaction(() => {
      db.exec(`DROP TABLE IF EXISTS ${tmp}`);
      db.exec(newSql);
      db.exec(`INSERT INTO ${tmp} SELECT * FROM ${table}`);
      if (hasDrivers) {
        // Переносим ссылки со старых водителей на пользователей с тем же телефоном
        db.exec(`
          UPDATE ${tmp} SET driver_id = (
            SELECT u.id FROM drivers d JOIN users u ON u.phone = d.phone
            WHERE d.id = ${tmp}.driver_id AND d.phone IS NOT NULL
            ORDER BY u.id LIMIT 1
          )
          WHERE EXISTS (
              SELECT 1 FROM drivers d JOIN users u ON u.phone = d.phone
              WHERE d.id = ${tmp}.driver_id AND d.phone IS NOT NULL
            )
        `);
      }
      db.exec(`DROP TABLE ${table}`);
      db.exec(`ALTER TABLE ${tmp} RENAME TO ${table}`);
    })();
    console.log(`  FIX: ${table}.driver_id теперь ссылается на users(id)`);
  }
}
const db = new Database("/tmp/t/polanet.db");
db.pragma("foreign_keys = OFF");
fixDriverForeignKeys(db);
fixDriverForeignKeys(db);
console.log(db.prepare("pragma foreign_key_list(deliveries)").all());
console.log(db.prepare("select driver_id,count(*) c from deliveries group by driver_id").all());
console.log(db.prepare("pragma foreign_key_check").all());
db.pragma("foreign_keys = ON");
console.log(db.prepare("insert into deliveries(order_id,driver_id,car_id,date_time,created_at,updated_at) values(2,7,1,'x','x','x')").run());

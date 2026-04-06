import knex, { Knex } from "knex";

declare global {
     var __masterKnex: Knex | undefined;
}

function getDb(): Knex {
     if (!global.__masterKnex) {
          global.__masterKnex = knex({
               client: "mysql2",
               connection: {
                    host: process.env.DB_HOST,
                    port: Number(process.env.DB_PORT),
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                    dateStrings: true,
               },
               pool: {
                    min: 0,
                    max: 10,
               },
          });
     }

     return global.__masterKnex;
}

export const db = getDb();

export async function withTransaction<T>(
     callback: (trx: Knex.Transaction) => Promise<T>
): Promise<T> {
     return db.transaction(async (trx) => callback(trx));
}

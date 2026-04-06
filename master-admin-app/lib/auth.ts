import { createHmac, timingSafeEqual } from "crypto";
import { db } from "./db";

const AUTH_TABLE = "master_admin_users";
const DEFAULT_USERNAME = "admin_super";
const DEFAULT_PASSWORD = "Barcelona45#";
const SESSION_COOKIE = "ma_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const getSecret = (): string => process.env.JWT_SECRET_KEY || "master-admin-session-secret";

const toBase64Url = (value: string): string => Buffer.from(value, "utf8").toString("base64url");
const fromBase64Url = (value: string): string => Buffer.from(value, "base64url").toString("utf8");

const signPayload = (payload: string): string => {
     return createHmac("sha256", getSecret()).update(payload).digest("base64url");
};

export const sessionCookieName = SESSION_COOKIE;

export async function ensureLoginTableAndSeed(): Promise<void> {
     const exists = await db.schema.hasTable(AUTH_TABLE);
     if (!exists) {
          await db.schema.createTable(AUTH_TABLE, (table) => {
               table.increments("id").primary();
               table.string("username", 80).notNullable().unique();
               table.string("password", 255).notNullable();
               table.boolean("is_active").notNullable().defaultTo(true);
               table.timestamp("created_at").defaultTo(db.fn.now());
               table.timestamp("updated_at").defaultTo(db.fn.now());
          });
     }

     const admin = await db(AUTH_TABLE)
          .where({ username: DEFAULT_USERNAME })
          .first<{ id: number }>();

     if (!admin) {
          await db(AUTH_TABLE).insert({
               username: DEFAULT_USERNAME,
               password: DEFAULT_PASSWORD,
               is_active: true,
          });
     }
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
     await ensureLoginTableAndSeed();

     const user = await db(AUTH_TABLE)
          .where({ username, is_active: true })
          .first<{ username: string; password: string }>();

     if (!user) return false;
     return user.password === password;
}

export function buildSessionToken(username: string): string {
     const payload = JSON.stringify({
          username,
          exp: Date.now() + SESSION_TTL_MS,
     });

     const encoded = toBase64Url(payload);
     const signature = signPayload(encoded);
     return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined): { valid: boolean; username?: string } {
     if (!token || !token.includes(".")) {
          return { valid: false };
     }

     const [encoded, signature] = token.split(".");
     if (!encoded || !signature) return { valid: false };

     const expected = signPayload(encoded);
     const signatureBuffer = Buffer.from(signature);
     const expectedBuffer = Buffer.from(expected);

     if (signatureBuffer.length !== expectedBuffer.length) {
          return { valid: false };
     }

     if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
          return { valid: false };
     }

     try {
          const parsed = JSON.parse(fromBase64Url(encoded)) as { username?: string; exp?: number };
          if (!parsed?.username || !parsed?.exp) {
               return { valid: false };
          }
          if (Date.now() > parsed.exp) {
               return { valid: false };
          }
          return { valid: true, username: parsed.username };
     } catch {
          return { valid: false };
     }
}

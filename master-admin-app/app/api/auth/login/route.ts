import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
     buildSessionToken,
     ensureLoginTableAndSeed,
     sessionCookieName,
     validateCredentials,
} from "../../../../lib/auth";

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();
          const username = `${body?.username || ""}`.trim();
          const password = `${body?.password || ""}`;

          if (!username || !password) {
               return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
          }

          // Ensure login table exists in real-time before every login attempt.
          await ensureLoginTableAndSeed();

          const ok = await validateCredentials(username, password);
          if (!ok) {
               return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
          }

          const token = buildSessionToken(username);
          cookies().set(sessionCookieName, token, {
               httpOnly: true,
               sameSite: "lax",
               secure: process.env.NODE_ENV === "production",
               path: "/",
               maxAge: 60 * 60 * 12,
          });

          return NextResponse.json({ status: "success", username }, { status: 200 });
     } catch {
          return NextResponse.json({ message: "Unable to complete login." }, { status: 500 });
     }
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureLoginTableAndSeed, sessionCookieName, verifySessionToken } from "../../../../lib/auth";

export async function GET() {
     try {
          // Keep this call so the auth table self-heals if missing.
          await ensureLoginTableAndSeed();

          const token = cookies().get(sessionCookieName)?.value;
          const session = verifySessionToken(token);

          if (!session.valid) {
               return NextResponse.json({ authenticated: false }, { status: 200 });
          }

          return NextResponse.json(
               { authenticated: true, username: session.username },
               { status: 200 }
          );
     } catch {
          return NextResponse.json({ authenticated: false }, { status: 200 });
     }
}

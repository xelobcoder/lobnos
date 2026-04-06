import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "../../../../lib/auth";

export async function POST() {
     cookies().set(sessionCookieName, "", {
          path: "/",
          maxAge: 0,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
     });

     return NextResponse.json({ status: "success" }, { status: 200 });
}

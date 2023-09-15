import { NextResponse, NextRequest } from "next/server";


export function middleware(NextRequest) {
  const response = NextResponse.next();
  const request = NextRequest;
  console.log(request.cookies)
  return response;
}


export const config = {
  matcher: '/api/auth/cookie',

}
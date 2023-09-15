import { NextResponse } from "next/server";

function handler(req, res) {

  res.json({
    token: 'hellow',
    id: 1,
    user: {
      time: new Date().toISOString(),
      headers: res.rawHeaders
    }
  })
}



export default handler
export default async function Handler(request, response) {
     if (request.method === "GET") {
          response.setHeader("Set-Cookie", "X-AUTH-PRIME-LAB-SYSTEMS=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
          response.status(200).json({ status: true });
     }
}

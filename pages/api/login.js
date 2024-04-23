import { customPost } from "../../components/Auth/customFetch";

export default async function Handler(request, response) {
     if (request.method === 'POST') {
          const { email, password } = request.body;

          if (!email || !password) {
               response
                    .status(400)
                    .json({ message: "Email and password are required", status: 'error' })
          }
          if (email && password) {
               const dbResponse = await customPost('authenticate', 'POST', { email, password });
               const { statusCode, status, token, user } = dbResponse;
               if (statusCode === 200 && status === "success" && token) {
                    const expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + 7);
                    response.setHeader('Set-Cookie', `X-AUTH-PRIME-LAB-SYSTEMS=${token}; Path=/; Expires=${expirationDate.toUTCString()}; HttpOnly; Secure; SameSite=Strict`);
                    response.status(200).json({ status: true, data: user });
               } else {
                    response.status(401).json({ error: "Authentication failed" });
               }
          }
     } else {
          response.status(405).json({ error: "Method Not Allowed" });
     }
}

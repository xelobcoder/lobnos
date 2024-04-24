import { customPost } from "../../components/Auth/customFetch";

export default async function Handler(request, response) {
     if (request.method === 'POST') {
          const { email, password, browserInformation } = request.body;
          if (!email || !password) {
               response
                    .status(400)
                    .json({ message: "Email and password are required", status: 'error' })
          }
          if (email && password) {
               const dbResponse = await customPost('authenticate', 'POST', { email, password, browserInformation });
               const { statusCode, status, token, user, data } = dbResponse;
               if (statusCode === 200 && status === "success" && token) {
                    const expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + 7);
                    response.setHeader('Set-Cookie', `X-AUTH-PRIME-LAB-SYSTEMS=${token}; Path=/; Expires=${expirationDate.toUTCString()}; HttpOnly; Secure; SameSite=Strict`);
                    response.status(200).json({ status: true, data: user });
               } else if (status == "multipleLogins") {
                    response.status(401).json({ status, data });
               } else {
                    response.status(404).json({status:'error' ,message: 'Authentication failed' })
               }
          }
     } else {
          response.status(405).json({ error: "Method Not Allowed" });
     }
}

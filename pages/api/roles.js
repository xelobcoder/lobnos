import database_queries from "./database/queries";

export default function Role_Handler(request, response) {
 const method = request.method;
 switch (method) {
  case 'GET':
   database_queries.getAllRoles(request, response)
   break
  case 'POST':
   const { fullname, username, role, password } = JSON.parse(request.body);
   database_queries.newRole(fullname, username, password, role, request, response)
   break
  case 'PUT':
   break
  case 'DELETE':
   break
 }
}
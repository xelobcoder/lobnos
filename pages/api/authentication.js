import { customFetch } from '../../components/Auth/customFetch'
export default async function handler(req, res) {
   try {
      const headers = req.rawHeaders;
      let jumpValue = null;
      let newheaders = {};
      headers.map((item, index) => {
         if (jumpValue == null) {
            jumpValue = 1;
            return { [item]: headers[index + 1] }
         }
         else if (index != jumpValue) {
            jumpValue = jumpValue + 2
            return { [item]: headers[index + 1] }
         }
         else return undefined
      }).filter((item, index) => item != undefined)
         .forEach((item, index) => {
            for (const [key, value] of Object.entries(item)) {
               newheaders = { ...newheaders, [key]: value }
            }
         })
      var cookies = {}
      newheaders['Cookie']
         .split(';')
         .map((item, index) => {
            const [key, value] = item.split('=');
            cookies = { [key]: value, ...cookies };
         })

      const token = cookies['X-AUTH-PRIME-LAB-SYSTEMS'];
      customFetch(`authenticate/employee/token?token=${token}`)
         .then((data) => {
            console.log(data)
         })
         .catch((err) => console.log(err))
      res.genesis = 'tiifu hamza';
      res.status(200).json(newheaders)
   } catch (err) {
      res.status(500).json({ error: 'failed to load data' })
   }
}
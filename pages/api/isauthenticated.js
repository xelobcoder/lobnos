export default async function handler(req, res) {
   try {
      const verificationToken = req.cookies['X-AUTH-PRIME-LAB-SYSTEMS'];
      if (!verificationToken) {
         res.send({ status: 'Expired' });
      } else {
         res.send({ status: 'loggedIn', token: verificationToken });
      }
   } catch (err) {
      res.status(500).json({ error: 'failed to load data' })
   }
}
import { existsSync, writeFile, readFile, mkdir } from 'node:fs'
import path from 'node:path';
import { customFetch } from '../../components/Auth/customFetch';


export default async function handler(request, response) {
   const { event } = request.query;
   if (!event) {
      return response.send({ message: 'event not provided' });
   }

   const istargetExist = existsSync(path.join(__dirname, 'cachedata', 'cachedata.json'));
   const filePath = path.join(__dirname, 'cachedata', 'cachedata.json');

   function onload(offload = false) {
      const fileExist = existsSync(path.join(__dirname, 'cachedata'));
      if (!fileExist) {
         mkdir(path.join(__dirname, 'cachedata'), function (err, data) {
            if (err) {
               throw err;
            }
         })
      }
      const filename = path.join(__dirname, 'cachedata', 'cachedata.json');
      const isDirExist = existsSync(path.join(__dirname, 'cachedata'));
      // we get the data to be cache from the backend api
      customFetch('cachedata/getSavedrecords')
         .then((data) => {
            let receiveddata = data;
            if (typeof data != 'string')
               receiveddata = JSON.stringify(data);
            if (isDirExist) {
               writeFile(filename, receiveddata, function (err, data) {
                  if (err) {
                     throw err;
                  }
                  if (offload) {
                     response.send(receiveddata);
                  }
               })
            }
         }).catch((err) => {
            response.send({ message: 'something wrong occured' });
         })
   }

   if (event === 'onload') {
      onload();
      response.send({ status: 'done' })
   } else if (event === 'getall') {
      if (existsSync(path.join(__dirname, 'cachedata', 'cachedata.json'))) {
         readFile(path.join(__dirname, 'cachedata', 'cachedata.json'), 'utf-8', function (err, data) {
            if (err) {
               throw err;
            }
            response.send(JSON.parse(data));
         })
      } else {
         onload(true);
      }
   } else if (event == 'getsingle' && request.query.hasOwnProperty('testid')) {
      const testid = request.query.testid;
      if (istargetExist) {
         readFile(filePath, 'utf-8', function (err, data) {
            if (err) {
               response.send({ message: 'something wrong occured' });
               throw err;
            }
            let receiveddata = JSON.parse(data);
            if (testid && receiveddata.length > 0) {
               let filtered = receiveddata.find((item, index) => item.testid == testid);
               if (filtered.hasOwnProperty('creationrule')) {
                  filtered = { ...filtered, creationrule: JSON.parse(filtered['creationrule']) };
                  return response.send(filtered)
               }
               return response.send({})
            } else {
               response.send([])
            }
         })
      } else {
         response.send({ message: 'data not loaded' });
      }
   } else {
      response.send({ message: 'event not known' })
   }
}
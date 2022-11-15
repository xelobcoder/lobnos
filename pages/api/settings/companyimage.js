import multer from 'multer';
import path from 'path';


export const config = {
 api: {
  bodyParser: false,
 },
}

const storage = multer.diskStorage({
 destination: (req, file, cb) => {
  let extension = file.originalname.split('.');
  let accepted = ['hjpeg', 'png', 'jpg'];

  if (accepted.includes(extension[1])) {
   cb(null, './public/asserts/companylogo')
  }

  return new Error('file type jpeg,png,jpg required')
 },
 filename: (req, file, cb) => {
  const uniqueSuffix = 'companylogo' + '' + path.extname(file.originalname);
  cb(null, uniqueSuffix)
  console.log(file)
 }
})


const upload = multer({ storage }).single('file');


export default function handler(req, res) {
 if (req.method == 'POST') {
  upload(req, res, (err) => {
   if (err) {
    throw err;
   }
   res.send({
    message: 'Image uploaded successfully'
   })
  })
 }
}
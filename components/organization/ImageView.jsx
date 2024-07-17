import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { AccountCircle } from '@mui/icons-material';

export default function ImageView({handleFile}) {
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
      handleFile(file)
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ mt: 3, ml: 10, mr: 10 }}>
      <input
        accept="image/*"
        id="image-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <label htmlFor="image-upload">
        <Typography variant='h6' className='d-flex mb-2  justify-content-center activated'>
          organization image
        </Typography>
        <Box
          component="span"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: '1px dashed grey',
            cursor: 'pointer',
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Image
              src={image}
              alt="Uploaded"
              width={200}
              height={200}
              style={{ width: '200px', height: '200px', borderRadius: '50%' }}
            />
          ) : (
            <AccountCircle sx={{ fontSize: '60px',height:'200px',width:'200px' }} />
          )}
        </Box>
      </label>
    </Box>
  );
}

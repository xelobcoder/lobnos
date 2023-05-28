import { Card, CardContent, Typography } from '@mui/material';
import React from 'react';

export default function Sampling({ data }) {
  return (
    <div>
      <Card style={{ background: '#3949ab', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <CardContent style={{ padding: '24px', textAlign: 'center' }}>
          <Typography variant="h7" style={{ fontWeight: 'bold', color: '#ffffff', marginBottom: '16px', textTransform: 'uppercase' }}>
            {data.title}
          </Typography>
          <Typography variant="h3" style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '60px', letterSpacing: '1px' }}>
            {data.value}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

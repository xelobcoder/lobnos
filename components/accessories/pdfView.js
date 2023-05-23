import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { useState } from 'react';
import { useEffect } from 'react';
import { Height } from '@mui/icons-material';

// Create styles


// Create Document Component
export default function PDF_VIEWER() {
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), [])

  return (
    <>
      <PDFViewer >
        <Document pageMode='fullScreen' pageLayout=''>
          <Page style={{padding:'20px'}} scale={1.75}>
            <View >
              <Text>
                Republican Tim Scott attacks
                Sen. Tim Scott jumped into the 2024 Republican race on Monday morning
                He has a war chest of more than $20 million and is running on message of hope
                But he must overcome frontrunners Donald Trump and Ron DeSantis
              </Text>
              <Text>
                <table>
                  <thead>
                    <tr>
                      <th>main</th>
                      <th>main</th>
                      <th>main</th>
                      <th>main</th>
                      <th>main</th>
                    </tr>
                  </thead>
                </table>
              </Text>
            </View>
            <View >
              <Text>
                Republican Tim Scott attacks Biden and says our nation is in
                Sen. Tim Scott jumped into the 2024 Republican race on Monday morning
                He has a war chest of more than $20 million and is running on message of hope
                But he must overcome frontrunners Donald Trump and Ron DeSantis
              </Text>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </>
  )
}


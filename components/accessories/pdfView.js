import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer, Table, TableHeader, TableCell, TableBody } from '@react-pdf/renderer';
import { useState } from 'react';
import { useEffect } from 'react';

// Create styles
const styles = StyleSheet.create({
    page: {
      backgroundColor: '#E4E4E4',
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1
    },
    table: {
      marginBottom: 10,
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#000000',
    },
    tableRow: {
      flexDirection:'row',
      margin:'0 20px'
    },
    tableHeader: {
      backgroundColor: '#859584',
      color: '#FFFFFF',
      padding: 0,
      fontSize:'10px',
      flex: 1,
    },
    tableCell: {
      padding: 8,
      fontSize:'10px',
      flex: 1,
    },
});

// Create Document Component
export default function PDF_VIEWER() {
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), [])

  return (
    <PDFViewer style={{ width: '100%', height: '98vh' }}>
      <Document>
        <Page size='A4' style={styles.page}>
        <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Test</Text>
              <Text style={styles.tableHeader}>Result</Text>
              <Text style={styles.tableHeader}>Range</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Test 1</Text>
              <Text style={styles.tableCell}>Pass</Text>
              <Text style={styles.tableCell}>0-10</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}


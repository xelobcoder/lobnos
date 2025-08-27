import React from "react";

export default function GreaterLessResultView({ fieldItem, index, resultsettings }) {
     if (!fieldItem) return null;
     const { name, units, value, plan, textReference } = fieldItem;
     const settings = resultsettings?.testBody || {};

     const determineFlag = (value, textReference) => {
          if (value == null || value === "" || !textReference) return '';
          const trimedTextReference = textReference.trim();
          const isGreaterComparer = trimedTextReference.startsWith('>');
          const isLessComparer = trimedTextReference.startsWith('<');

          if (!isGreaterComparer && !isLessComparer) return '';

          const textReferenceValue = parseFloat(trimedTextReference.slice(1));
          const numValue = parseFloat(value);
          if (isNaN(numValue)) return '';
          if (isGreaterComparer) {
               if (numValue >= textReferenceValue) return 'N';
               if (numValue < textReferenceValue) return 'L';
               return '';
          }
          if (isLessComparer) {
               if (numValue < textReferenceValue) return 'N';
               if (numValue >= textReferenceValue) return 'H';
               return '';
          }
          return '';
     };

     const flag = determineFlag(value, textReference);

     return (
          <tr style={{
               fontSize: `${settings?.fontSize}px`,
               fontFamily: settings?.fontFamily,
               color: settings?.color
          }}>
               <td style={{ width: '45%' }}>
                    <span style={{ fontWeight: settings?.boldenParameter ? '500' : 'normal' }}>{name}</span>
               </td>
               <td style={{ width: '20%' }}>
                    {flag === 'H' || flag === 'L' ? (
                         <span style={{ fontWeight: settings?.boldenValue ? '500' : 'normal', }}>
                              {value}
                         </span>
                    ) : (
                         <span style={{ fontWeight: settings?.boldenValue ? '500' : 'normal' }}>{value}</span>
                    )}
               </td>
               <td style={{ width: '10%' }}>
                    <span style={{ fontWeight: settings?.boldenUnits ? '500' : 'normal' }}>{units}</span>
               </td>
               <td style={{ width: '20%' }}>
                    {textReference}
               </td>
               <td style={{ width: '5%' }}>
                    {flag === 'H' ? (
                         <span style={{ color: settings?.hasColorsForFlags ? settings?.hightFlagColor : settings?.color, fontWeight: '500' }}>H</span>
                    ) : flag === 'L' ? (
                         <span style={{ color: settings?.hasColorsForFlags ? settings?.lowFlagColor : settings?.color, fontWeight: '500' }}>L</span>
                    ) : ''}
               </td>
          </tr>
     );
}

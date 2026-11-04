import React from "react";

export default function GreaterLessResultView({ fieldItem, index, resultsettings }) {
     if (!fieldItem) return null;
     const { name, units, value, plan, textReference } = fieldItem;
     const settings = resultsettings?.testBody || {};

     const parseOperatorAndValue = (textRef) => {
          if (!textRef) return { operator: null, value: NaN };

          const str = textRef.trim();
          let operatorPart = '';
          let textBeforeNum = '';
          let numericStr = '';

          for (let i = 0; i < str.length; i++) {
               const char = str[i];
               if (char === '<' || char === '>' || char === '=') {
                    operatorPart += char;
               } else if (/\d/.test(char) || (char === '.' && numericStr)) {
                    numericStr += char;
               } else if (!operatorPart && !numericStr) {
                    textBeforeNum += char;
               }
          }

          if (!operatorPart || !numericStr) {
               return { operator: null, value: NaN };
          }

          let operator = null;

          if (operatorPart.includes('=')) {
               if (operatorPart.includes('<') && operatorPart.includes('=')) {
                    operator = '<=';
               } else if (operatorPart.includes('>') && operatorPart.includes('=')) {
                    operator = '>=';
               } else {
                    return { operator: null, value: NaN };
               }
          } else {
               const hasLess = operatorPart.includes('<');
               const hasGreater = operatorPart.includes('>');

               if (hasLess && hasGreater) {
                    return { operator: null, value: NaN };
               }

               if (hasLess) {
                    operator = '<';
               } else if (hasGreater) {
                    operator = '>';
               } else {
                    return { operator: null, value: NaN };
               }
          }

          const numValue = parseFloat(numericStr);
          return { operator, value: numValue };
     };

     const determineFlag = (value, textReference) => {
          if (value == null || value === "" || !textReference) return '';

          const { operator, value: refValue } = parseOperatorAndValue(textReference);
          const numValue = parseFloat(value);

          if (!operator || isNaN(refValue) || isNaN(numValue)) return '';

          if (operator === '>') {
               if (numValue > refValue) return 'N';
               if (numValue <= refValue) return 'L';
          }
          if (operator === '>=') {
               if (numValue >= refValue) return 'N';
               if (numValue < refValue) return 'L';
          }
          if (operator === '<') {
               if (numValue < refValue) return 'N';
               if (numValue >= refValue) return 'H';
          }
          if (operator === '<=') {
               if (numValue <= refValue) return 'N';
               if (numValue > refValue) return 'H';
          }
          return '';
     };

     const flag = fieldItem.flag ?? fieldItem.indicator ?? determineFlag(value, textReference);

     return (
          <tr data-result-flag={flag} style={{
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

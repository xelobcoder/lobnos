export default function LimitViewHtmlGeneratorResultView({ fieldItem, index, resultsettings }) {
     const { name, value, upperlimit, lowerlimit, units } = fieldItem;

     // Get settings from resultsettings or use defaults
     const settings = resultsettings?.testBody

     const determineTableColor = (value, upperlimit, lowerlimit) => {
          if (value == null || value === "" || isNaN(upperlimit) || isNaN(lowerlimit)) return '';
          let valStr = String(value).trim();
          let numValue = null;
          let compareType = null;
          // Check for > or < symbols
          if (valStr.startsWith('>')) {
               compareType = '>';
               numValue = parseFloat(valStr.slice(1));
          } else if (valStr.startsWith('<')) {
               compareType = '<';
               numValue = parseFloat(valStr.slice(1));
          } else {
               numValue = parseFloat(valStr);
          }
          upperlimit = parseFloat(upperlimit);
          lowerlimit = parseFloat(lowerlimit);
          if (isNaN(numValue)) return '';
          // If value is >X, treat as X for flagging
          if (compareType === '>') {
               if (numValue > upperlimit) return 'H';
               if (numValue < lowerlimit) return 'L';
               return '';
          }
          // If value is <X, treat as X for flagging
          if (compareType === '<') {
               if (numValue > upperlimit) return 'H';
               if (numValue < lowerlimit) return 'L';
               return '';
          }
          // Normal numeric value
          if (numValue > upperlimit) return 'H';
          if (numValue < lowerlimit) return 'L';
          return '';
     }

     const flag = fieldItem.flag ?? fieldItem.indicator ?? determineTableColor(value, upperlimit, lowerlimit);

     // Determine flag color based on settings
     const getFlagColor = (flag) => {
          if (!settings?.hasColorsForFlags) return settings?.color;
          if (flag === 'H') return settings?.hightFlagColor;
          if (flag === 'L') return settings?.lowFlagColor;
          return settings?.color;
     };

     return (
          <tr style={{
               fontSize: `${settings?.fontSize}px`,
               fontFamily: settings?.fontFamily,
               color: settings?.color
          }}>
               <td style={{ width: '45%' }}>
                    <span style={{
                         fontWeight: settings?.boldenParameter ? '500' : 'normal'
                    }}>
                         {name}
                    </span>
               </td>
               <td style={{ width: '20%' }}>
                    {flag === 'H' || flag === "L" ? (
                         <span style={{
                              fontWeight: settings?.boldenValue ? '500' : 'normal',
                              color: settings?.highlightFlags ? getFlagColor(flag) : settings?.color
                         }}>
                              {value}
                         </span>
                    ) : (
                         <span style={{
                              fontWeight: settings?.boldenValue ? '500' : 'normal'
                         }}>
                              {value}
                         </span>
                    )}
               </td>
               <td style={{ width: '10%' }}>
                    <span style={{
                         fontWeight: settings?.boldenUnits ? '500' : 'normal'
                    }}>
                         {units}
                    </span>
               </td>
               <td style={{ width: '20%' }}>
                    {lowerlimit}~{upperlimit}
               </td>
               <td style={{ width: '5%' }}>
                    {flag === 'H' ? (
                         <span style={{
                              color: settings?.hasColorsForFlags ? settings?.hightFlagColor : settings?.color,
                              fontWeight: '500'
                         }}>
                              H
                         </span>
                    ) : flag === 'L' ? (
                         <span style={{
                              color: settings?.hasColorsForFlags ? settings?.lowFlagColor : settings?.color,
                              fontWeight: '500'
                         }}>
                              L
                         </span>
                    ) : ''}
               </td>
          </tr>
     )
}
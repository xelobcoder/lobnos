export default function LimitViewHtmlGeneratorResultView({ fieldItem, index, resultsettings }) {
     const { name, value, upperlimit, lowerlimit, units } = fieldItem;

     // Get settings from resultsettings or use defaults
     const settings = resultsettings?.testBody

     const determineTableColor = (value, upperlimit, lowerlimit) => {
          if (!isNaN(value) && value != "" && !isNaN(upperlimit) && !isNaN(lowerlimit)) {
               value = parseFloat(value);
               upperlimit = parseFloat(upperlimit);
               lowerlimit = parseFloat(lowerlimit);
               if (value > upperlimit) return 'H'
               else if (value < lowerlimit) return 'L'
               else return ''
          }
     }

     const flag = determineTableColor(value, upperlimit, lowerlimit);
     
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
               <td style={{ width: '50%' }}>
                    <span style={{ 
                         fontWeight: settings?.boldenParameter ? '500' : 'normal' 
                    }}>
                         {name}
                    </span>
               </td>
               <td style={{ width: '15%' }}>
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
               <td style={{ width: '15%' }}>
                    <span style={{ 
                         fontWeight: settings?.boldenUnits ? '500' : 'normal' 
                    }}>
                         {units}
                    </span>
               </td>
               <td style={{ width: '15%' }}>
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
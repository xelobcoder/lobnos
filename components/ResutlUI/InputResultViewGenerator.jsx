
export default function InputResultViewGenerator({ fieldItem, index, resultsettings }) {
     const { name, units, value } = fieldItem;
     const settings = resultsettings?.testBody || {};

     return (
          <tr style={{
               fontSize: `${settings?.fontSize}px`,
               fontFamily: settings?.fontFamily,
               color: settings?.color,
               width: '100%',
          }}>
               <td >
                    <span style={{ fontWeight: settings?.boldenParameter ? '500' : 'normal', width: '45%' }}>{name}</span>
               </td>
               <td colSpan={3}>
                    <span style={{ fontWeight: settings?.boldenValue ? '500' : 'normal' }}>{value}</span>
               </td>
              
          </tr>
     );
}

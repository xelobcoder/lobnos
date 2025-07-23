export default function LimitViewHtmlGeneratorResultView({ fieldItem, index }) {
     const { name, value, upperlimit, lowerlimit, units } = fieldItem;


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
     const rowStyle = flag === 'H' ? { fontWeight: 'bold', fontSize: '14px', background: '#ffeaea' }
          : flag === 'L' ? { fontWeight: 'bold', fontSize: '14px', background: '#eaf1ff' }
               : { fontSize: '14px' };

     return (
          <tr style={rowStyle}>
               <td>  {"> "}{name}</td>
               <td>
                    {flag === 'H' ? <span style={{ color: 'red' }}>{value}</span>
                         : flag === 'L' ? <span style={{ color: 'blue' }}>{value}</span>
                              : value}
               </td>
               <td>
                    {units}
               </td>
               <td>
                    {lowerlimit}~{upperlimit}
               </td>
               <td>
                    {flag === 'H' ? <span style={{ color: 'red' }}>H</span>
                         : flag === 'L' ? <span style={{ color: 'blue' }}>L</span>
                              : ''}
               </td>
          </tr>
     )
}
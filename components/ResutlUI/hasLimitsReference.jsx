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


     return (<tr style={{ fontSize: '14px' }}>
          <td>  {"> "}{name}</td>
          <td>
               {value}
          </td>
          <td>
               {units}
          </td>
          <td>
               {lowerlimit}~{upperlimit}
          </td>
          <td>
               {determineTableColor(value, upperlimit, lowerlimit)}
          </td>
     </tr>)
}

export default function GreaterLessViewHtmlGenerator({ fieldItem, statehandler, index }: {fieldItem: import("../../settingsComponents/FieldsCreation/data/types").CreationRule & {entrymode?: string}; statehandler: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void; index: number}) {
     const { name, units, value, fieldConstraints, entrymode, textReference } = fieldItem;

     const parseOperatorAndValue = (textRef: string) => {
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

          let operator: string | null = null;

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

     const determineFlag = (val: string | number, textRef: string) => {
          if (val == null || val === "" || !textRef) return '';

          const { operator, value: refValue } = parseOperatorAndValue(textRef);
          const numValue = parseFloat(String(val));

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

     const flag = determineFlag(value, textReference);

     const getRowClass = () => {
          if (flag === 'H' || flag === 'L') {
               return 'table-danger';
          }
          if (flag === 'N') {
               return 'table-success';
          }
          return '';
     };

     return <tr className={getRowClass()}>
          <td>{name}</td>
          <td><input value={value} type="number" step={0.1} min={0.0} onChange={(ev) => { statehandler(ev, index) }} className="custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} /></td>
          <td>{units}</td>
          <td>{textReference}</td>
          <td className="pls-d-none">
               {entrymode}
          </td>
          <td className="pls-d-none">

          </td>
     </tr>
}

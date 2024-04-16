export default function HasLimitReference({ item }) {
  const { plain, useplain, haslimits } = item
  let plainField = plain

  const reference = () => {
    if (useplain) {
      if (plain.toString().includes(",")) {
        plainField = plain
          .toString()
          .split(",")
          .map((item, index) => {
            return (
              <span key={index}>
                {" "}
                {item} <br />
              </span>
            )
          })
      }
    } else {
      return (
        <span>
          {item.upperlimit} {" - "} {item.lowerlimit}
        </span>
      )
    } 
  }

  const flags = () => {
    if (haslimits) {
      const { upperlimit,value, lowerlimit } = item;
      const upper = parseFloat(upperlimit);
      const lower = parseFloat(lowerlimit);
      const current = parseFloat(value);
      if (upper > current) {
        return "H"
      } else if (current < lower) {
        return 'L'
      } else {
        return "N"
      }
    }
  }

  return (
    <tr>
      <td className="receipt-border text-capitalize">{item.name}</td>
      <td className="receipt-border py-3">{item.value}</td>
      <td className="receipt-border py-3">{item.units}</td>
      <td className="receipt-border py-3">{reference()}</td>
      {haslimits && <td className="receipt-border py-3">{flags()}</td>}
    </tr>
  )
}

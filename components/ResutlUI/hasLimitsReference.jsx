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
      } else {
        return plain
      }
    } else {
      return (
        <span>
          {item.lowerlimit} {" ~ "} {item.upperlimit}
        </span>
      )
    }
  }

  const flags = () => {
    if (haslimits) {
      const { upperlimit, value, lowerlimit } = item
      const upper = parseFloat(upperlimit)
      const lower = parseFloat(lowerlimit)
      const current = parseFloat(value)
      if (current > upper) {
        return "H"
      } else if (current < lower) {
        return "L"
      } else {
        return ""
      }
    }
  }

  return (
    <tr className="p-0">
      <td colSpan={2} className="p-1 text-capitalize fw-bold">{item.name}</td>
      <td className="p-1">{item.value}</td>
      <td className="p-1">{item.units}</td>
      <td className="p-1">{reference()}</td>
      {haslimits && <td>{flags()}</td>}
    </tr>
  )
}

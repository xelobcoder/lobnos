interface HasLimitReferenceProps {
  item: {
    plain?: string;
    useplain?: boolean;
    haslimits?: boolean;
    name: string;
    value: string;
    units?: string;
    lowerlimit?: string;
    upperlimit?: string;
  };
}

export default function HasLimitReference({ item }: HasLimitReferenceProps) {
  const { plain, useplain, haslimits } = item
  let plainField = plain

  const reference = () => {
    if (useplain) {
      if (plain && plain.toString().includes(",")) {
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
        return plainField
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
    if (haslimits && item.upperlimit && item.lowerlimit && item.value) {
      const upper = parseFloat(item.upperlimit)
      const lower = parseFloat(item.lowerlimit)
      const current = parseFloat(item.value)
      if (current > upper) {
        return "H"
      } else if (current < lower) {
        return "L"
      } else {
        return ""
      }
    }
    return ""
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
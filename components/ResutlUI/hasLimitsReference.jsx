export default function HasLimitReference({ item }) {
  const { plain, useplain } = item
  let plainField = plain
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
  }

  return (
    <tr>
      <td className="receipt-border text-capitalize">{item.name}</td>
      <td className="receipt-border">{item.value}</td>
      <td className="receipt-border">{item.units}</td>
      <td className="receipt-border">{plainField}</td>
    </tr>
  )
}

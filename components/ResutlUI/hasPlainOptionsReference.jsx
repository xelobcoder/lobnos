export default function HasPlainOptionsReference({item}) {
  return (
    <div key={index} className={"grid grid-3"}>
      <div className="text-capitalize">{item.name}</div>
      <div>{item.value}</div>
      <div>{item.units}</div>
      <div>
        <span>{item.upperlimit}</span>
        <span>{"-"}</span>
        <span>{item.lowerlimit}</span>
      </div>
    </div>
  )
}

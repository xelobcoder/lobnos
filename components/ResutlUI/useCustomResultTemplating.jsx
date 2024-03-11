export default function UseCustomResultTemplating({ result, testname }) {
  const reformatTest = (result) => {
    if (!result) return

    let plainResult = Object.entries(result).map((item, index) => {
      return { key: item[0], value: item[1] }
    })

    return plainResult
  }

  const renderingView = () => {
    if (typeof result != "object" || Object.keys(result).length == 0) return <h4>Wrong format provided</h4>
    else {
      return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "2% 40% auto" }}>
            <div>{""}</div>
            <div >
              <span className="text-capitalize text-dark  fw-bold border-bottom border-secondary border-0">parameter</span>
            </div>
            <div >
              <span >value</span>
            </div>
          </div>
          {reformatTest(result).map((item, index) => {
            const { key, value } = item
            return (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "2% 40% auto" }}>
                <div>{">>"}</div>
                <div className="text-capitalize">{key}</div>
                <div>{value}</div>
              </div>
            )
          })}
        </div>
      )
    }
  }
  return (
    <div>
      <h5 className="text-uppercase text-center">{testname}</h5>
      <section>{renderingView()}</section>
    </div>
  )
}

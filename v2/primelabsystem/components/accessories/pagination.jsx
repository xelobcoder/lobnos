import { useState } from "react"

export default function Pagination({ page, load, updateFunction }) {
  const [active, setActive] = useState(page || 0)
  const paginate = (value) => {
    updateFunction(value)
    load(true)
    setActive(value)
  }

  const paginateLoop = (maximum) => {
    if (!maximum) return
    const value = []
    let current = 1
    while (current <= maximum) {
      value.push(current)
      current++
    }

    return value.map((item, index) => {
      return (
        <li
          key={index}
          onClick={(ev) => {
            paginate(item)
          }}
          className="page-item ">
          <a className={`page-link pls-color  ${active === item && "bg-primary text-white"}`}>{item}</a>
        </li>
      )
    })
  }


  const inputvalue = (ev) => {
    let { value } = ev.target;
    value = parseInt(value);
    if (value == 0 || !value) return;
    paginate(value);
  }


  return (
    <nav aria-label="pagination d-flex" >
      <ul className={` pagination pointer`}>
        {paginateLoop(5)}
        <li
          onClick={(ev) => {
            paginate("increment");
          }}
          className="page-item pointer">
          <a className={`page-link ${active === "increment" && "bg-primary text-white"}`}>Next</a>
        </li>
        <li
          onClick={(ev) => {
            paginate("decrement");
          }}
          className="page-item pointer">
          <a className={`page-link ${active === "decrement" && "bg-primary text-white"}`}>Previous</a>
        </li>
        <li>
          <input onBlur={(ev) =>  {inputvalue(ev)}} placeholder="Pg No." className="custom-input col-12 mx-1" type="number" max={100} min={1} />
        </li>
      </ul>
    </nav>
  );
}

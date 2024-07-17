import { useEffect, useState } from "react"

export default function CardRacks({ header, activestate, body, className, footer, icon = null, ...otherProps }) {
  const [active, setActive] = useState(activestate)

  useEffect(() => {
    setActive(activestate);
  }, [activestate])

  return (
    <div className={`card pointer mx-2 my-2 ${active && "rack-active"} ${className}`} id={`rack`} {...otherProps}>
      <div className={`card-header fw-bold text-capitalize ${active && "rack-header-active"}`} id={`rack-header`}>
        {icon} {header}
      </div>
      <div className="card-body ower-borders-none br-0 p-0" id="rack-body">
        {body}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}

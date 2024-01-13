import React, { useState } from "react";

export default function CardRacks  ({ header, activestate, body, icon = null, ...otherProps }) {
  const [active, setActive] = useState(activestate);

  return (
    <div
      className={`card pointer mx-2 my-2 ${active && 'rack-active'}`}
      id={`rack`}
      {...otherProps}
    >
      <div
        className={`card-header fw-bold text-capitalize ${active && 'rack-header-active'}`}
        id={`rack-header`}
      >
        {icon} {header}
      </div>
      <div className="card-body br-0" id="rack-body">
        {body}
      </div>
    </div>
  );
};



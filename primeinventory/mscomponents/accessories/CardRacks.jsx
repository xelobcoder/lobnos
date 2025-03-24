export default function CardRacks({ header, activestate, body, className, footer, icon = null, ...otherProps }) {
  return (
    <div className="list-group br-0 pointer pls-color">
      <div className="list-group-item br-0  bg-secondary-subtle fw-bold text-capitalize">
        {icon} {header}
      </div>
      <div className="list-group-item" >
        {body}
      </div>
      {footer && <div className="list-group-item">{footer}</div>}
    </div>
  );
}

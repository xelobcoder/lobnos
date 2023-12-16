export default function EmailLogList({ data }) {
  return (
    <div className="list-group">
      {
        data.map((item, index) => (
          <div key={index} className="list-group-item grid" style={{display:'grid',gridTemplateColumns:'5% 20% 40% 10% auto'}}>
            <span>{item.id}</span>
            <span>{ new Date(item?.date).toLocaleDateString()}</span>
            <span >{item?.type}</span>
            <span>{item?.target}</span>
            <span className={item?.success == 1 ? "badge-success" : "badge-error"}>
              {item.success === 1 ? "success" : "failed"}
            </span>
          </div>
        ))
      }
    </div>
  );
}
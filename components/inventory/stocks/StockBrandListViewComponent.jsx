import { Delete, Edit } from "@mui/icons-material";

const StockBrandListViewComponent = ({ brands, onDelete, onEdit }) => {
  console.log(brands);
  const renderer = () => {
    if (brands.length == 0) {
      return <div className="alert alert-info mx-2 bg-opacity-25 p-3">No Brand Available</div>;
    } else {
      return brands.map((item, index) => {
        return (
          <div key={index} style={{ fontSize: "14px" }} className="lims-color border-bottom px-3 py-2 grid-30-30-30">
            <span>{new Date(item?.created_on).toLocaleDateString()}</span>
            <span>{item?.brand}</span>
            <span>
              <Edit
                onClick={(ev) => {
                  onEdit(item);
                }}
                color="primary"
              />
              <Delete
                onClick={(ev) => {
                  onDelete(item);
                }}
                color="error"
              />
            </span>
          </div>
        );
      });
    }
  };
  return <div className="m-0">{renderer()}</div>;
};

export default StockBrandListViewComponent;

import { currencyFormatter } from "../Auth/customFetch";
import AutoDeleteIcon from "@mui/icons-material/AutoDelete";
import { Clear } from "@mui/icons-material";

export default function TESTCART({ testArray, emptytestcart, handleRemove, calculate }) {
  const renderer = () => {
    if (testArray.length <= 0) {
      return <h6>No data added to cart</h6>;
    } else {
      return (
        <div className="list-group">
          {testArray.map((item, index) => (
            <div key={index} className="list-group-item p-3  grid-30-30-30 ">
              <div>
                <span>
                  {index + 1}. {item.name}
                </span>
              </div>
              <span className="badge bg-primary rounded-pill ms-2">{currencyFormatter.format(item.price)}</span>
              <div>
                <Clear onClick={(e) => handleRemove(e, item)} color="error" style={{ cursor: "pointer" }} />
              </div>
            </div>
          ))}
          <div className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <span>Amount</span>
              <span className="badge bg-primary rounded-pill ms-2">
                {currencyFormatter.format(testArray.reduce((acc, curr) => acc + curr.price, 0))}
              </span>
            </div>
            <button className="btn btn-danger btn-sm" onClick={(e) => emptytestcart(e)}>
              <AutoDeleteIcon /> Remove All
            </button>
          </div>
        </div>
      );
    }
  };

  return <>{renderer()}</>;
}

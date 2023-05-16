import { useState } from "react";
import { TextField, Button } from "@mui/material";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";
export default function RandomBloodSugar({clientdata, type}) {
  const [data, setData] = useState({
    result: "",
    comment: "",
  });
  const handleResult = (e) => {
    console.log(data);
  };
  return (
    <>
      <div className="p-4">
        <form>
        <Indicator resultEntered={false} />
          <h4>Random Blood Sugar Test</h4>
          <div className="form-group">
            <TextField
              sx={{ width: "100%", marginTop: "30px" }}
              size="small"
              label= {type}
              variant="outlined"
              type="number"
              value={data.result}
              onChange={(e) =>
                setData({ ...data, result: e.target.value })
              }
            />
          </div>
          <CommentSection/>
          <div className="form-group mt-3">
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={(e) => handleResult(e)}
            >
              save result
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

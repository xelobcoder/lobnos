import { useState } from "react";
import { TextField, Button } from "@mui/material";
export default function RandomBloodSugar() {
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
          <div className="form-group">
            <TextField
              sx={{ width: "100%", marginTop: "30px" }}
              size="small"
              label="Random Blood Sugar"
              variant="outlined"
              type="number"
              value={data.result}
              onChange={(e) =>
                setData({ ...data, result: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <TextField
              sx={{ width: "100%", marginTop: "30px" }}
              size="small"
              label="Comment"
              variant="outlined"
              type="text"
              value={data.comment}
              onChange={(e) => setData({ ...data, comment: e.target.value })}
            />
          </div>
          <div className="form-group mt-3">
            <Button
              variant="contained"
              color="primary"
              size="small"
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

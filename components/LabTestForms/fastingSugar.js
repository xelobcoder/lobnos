import { useState } from "react";
import { TextField, Button } from "@mui/material";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";
import { handleComments } from "../Auth/customFetch";
export default function FastingSugar() {
  const [fasting, setFasting] = useState({ value: "", comments: "" });
  const [resultEntered, setResultEntered] = useState(false);
  return (
    <>
      <div className="p-4">
        <form>
          <Indicator />
          <h4 className="text-capitalize">fasting blood sugar test</h4>
          <div>
            <TextField
              size="small"
              label="fasting sugar"
              variant="outlined"
              type="number"
              sx={{width:'97%'}}
              value={fasting.value}
              onChange={(e) => setFasting({...fasting,value:e.target.value })}
            />
          </div>
          <CommentSection getcomment={handleComments}
           datasource={fasting} target={'comments'}
           value={fasting.comments} datafunction={setFasting} />
          <Button
            className="mt-3"
            variant="contained"
            color="primary"
            type="button"
          >
            save result
          </Button>
        </form>
      </div>
    </>
  );
}

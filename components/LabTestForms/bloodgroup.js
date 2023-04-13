import { Autocomplete, TextField, Button } from "@mui/material";
import { useState,useMemo} from "react";

export default function BloodGroup() {
  const option = ['', 'A', 'B', 'AB', 'O'];
  const optionRhesus = ['', 'positive', 'negative'];
  const [group, setGroup] = useState('');
  const [rhesus, setRhesus] = useState('');
 



  return (
    <>
      <div className="p-3">
        <div>
          <Autocomplete
            size="small"
            options={option}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <TextField {...params} label="blood group" variant="outlined" />
            )}
            sx={{marginBottom:'20px'}}
            value={group}
            onChange={(e, newValue) => setGroup(newValue)}
          >

          </Autocomplete>
        </div>
        <div>
          <Autocomplete
            size="small"
            options={optionRhesus}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <TextField {...params} label="rhesus" variant="outlined" />
            )}
            value={rhesus}
            onChange={(e, newValue) => {
              setRhesus(newValue);
            }}
          ></Autocomplete>
        </div>
        <div>
          <Button
            className="mt-3"
            variant="contained"
            color="primary"
            type="button"
           
          >
            save result
          </Button>
        </div>
      </div>
    </>
  );
}
import react from "react";
import { Button, TextField } from "@mui/material";
import "./form.css";
import InputAdornment from "@mui/material/InputAdornment";
import Person from "@mui/icons-material/Person";
import Lock from "@mui/icons-material/Lock";
import Email from "@mui/icons-material/Email";
import Send from "@mui/icons-material/Send";

class Form extends react.Component {
  constructor(props) {
    super(props);
    // for each item in props.fields, create an item in this.state.fields
    let fields = [];
    for (let i = 0; i < props.fields.length; i++) {
      fields.push(["", props.fields[i]]);
    }
    this.state = {
      fields: fields,
    };
  }

  handleChange = (event, index) => {
    let fields = this.state.fields;
    fields[index][0] = event.target.value;
    this.setState({ fields: fields });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    let fields = this.state.fields;
    let data = {};
    for (let i = 0; i < fields.length; i++) {
      data[fields[i][1]] = fields[i][0];
    }
    data["generatedOTPToken"] = this.props.generatedOTP;
    this.props.submit(data);
  };

  render() {
    return (
      <div>
        <div>
          <Button
            variant="outlined"
            id="go-back-button"
            onClick={this.props.close}
          >
            {" "}
            Go Back{" "}
          </Button>
          <h3> {this.props.type} </h3>
        </div>

        <form onSubmit={this.handleSubmit}>
          {this.state.fields.map((field, index) => {
            if (field[1] === "Username") {
              return (
                <div key={"auth" + field[1]}>
                  <TextField
                    variant="filled"
                    key={"auth" + field[1]}
                    label={field[1]}
                    onChange={(event) => this.handleChange(event, index)}
                    id={field[1]}
                    margin="normal"
                    sx={{ width: "300px" }}
                    color="success"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              );
            } else if (field[1] === "Password") {
              return (
                <div key={"auth" + field[1]}>
                  <TextField
                    variant="filled"
                    key={"auth" + field[1]}
                    label={field[1]}
                    onChange={(event) => this.handleChange(event, index)}
                    id={field[1]}
                    type={"Password"}
                    margin="normal"
                    sx={{ width: "300px" }}
                    color="warning"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              );
            } else if (field[1] === "Email") {
              return (
                <div key={"auth" + field[1]}>
                  <TextField
                    variant="filled"
                    key={"auth" + field[1]}
                    label={field[1]}
                    onChange={(event) => this.handleChange(event, index)}
                    id={field[1]}
                    margin="normal"
                    sx={{ width: "300px" }}
                    color="success"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              );
            } else if (field[1] === "OTPToken") {
              return (
                <div key={"auth" + field[1]}>
                  <TextField
                    variant="filled"
                    key={"auth" + field[1]}
                    label={field[1]}
                    onChange={(event) => this.handleChange(event, index)}
                    id={field[1]}
                    margin="normal"
                    sx={{ width: "300px" }}
                    color="success"
                    helperText="Click generate and paste the login code here!"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Send />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              );
            } else {
              return (
                <div key={"auth" + field[1]}>
                  <TextField
                    variant="filled"
                    key={"auth" + field[1]}
                    label={field[1]}
                    onChange={(event) => this.handleChange(event, index)}
                    id={field[1]}
                    margin="normal"
                    sx={{ width: "300px" }}
                    color="success"
                    required
                  />
                </div>
              );
            }
          })}
          <Button
            variant="contained"
            onClick={(e) => this.handleSubmit(e)}
            id="submit-button"
          >
            Submit
          </Button>
        </form>
      </div>
    );
  }
}

export default Form;

import react from "react";
import Form from "../Components/form.js";
import { Button } from "@mui/material";
import "./Auth.css";

class Auth extends react.Component {
  constructor(props) {
    super(props);
    this.state = {
      showForm: false,
      selectedForm: undefined,
      generatedOTPToken: Date.now(),
      isButtonDisabled: false,
    };
  }

  closeForm = () => {
    this.setState({ showForm: false });
  };

  login = (data) => {
    fetch(this.props.server_url + "/api/auth/login", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => {
      res.json().then((data) => {
        if (data.message === "Logged in") {
          this.props.changeScreen("lobby");
        } else {
          alert(data.message);
        }
      });
    });
  };

  register = (data) => {
    fetch(this.props.server_url + "/api/auth/register", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => {
      res.json().then(() => {
        alert("Account created");
        this.props.changeScreen("auth");
        window.location.reload();
      });
    });
  };

  otpToken = (event) => {
    event.preventDefault();
    this.setState({
      isButtonDisabled: true,
    });
    setTimeout(() => this.setState({ isButtonDisabled: false }), 10000);
    fetch(this.props.server_url + "/api/auth/otptoken", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ Email: document.getElementById("Email").value }),
    }).then((res) => {
      res.json().then((data) => {
        alert(data.message);
        this.setState({ generatedOTPToken: data.dataSaved.generatedOTP });
      });
    });
  };

  render() {
    let display = null;
    if (this.state.showForm) {
      let fields = [];
      if (this.state.selectedForm === "login") {
        fields = ["Username", "Password", "Email", "OTPToken"];
        display = (
          <div>
            <Form
              fields={fields}
              close={this.closeForm}
              type="Login Form"
              submit={this.login}
              key={this.state.selectedForm}
              generatedOTP={this.state.generatedOTPToken}
            />
            <Button
              variant="outlined"
              onClick={this.otpToken}
              id="generate-otp-button"
              disabled={this.state.isButtonDisabled}
            >
              Generate OTP Token to Login
            </Button>
          </div>
        );
      } else if (this.state.selectedForm === "register") {
        fields = ["Username", "Password", "Email"];
        display = (
          <Form
            fields={fields}
            close={this.closeForm}
            type="Register Form"
            submit={this.register}
            key={this.state.selectedForm}
          />
        );
      }
    } else {
      display = (
        <div>
          <Button
            variant="contained"
            id="login-button"
            onClick={() =>
              this.setState({ showForm: true, selectedForm: "login" })
            }
          >
            Login
          </Button>
          <Button
            variant="contained"
            id="register-button"
            onClick={() =>
              this.setState({ showForm: true, selectedForm: "register" })
            }
          >
            Register
          </Button>
        </div>
      );
    }
    return (
      <div id="main-container">
        <h1> Welcome to our chat application! </h1>
        <svg
          id="chat-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="60"
          fill="currentColor"
          className="bi bi-chat"
          viewBox="0 0 16 16"
        >
          <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z" />
        </svg>
        {display}
      </div>
    );
  }
}

export default Auth;

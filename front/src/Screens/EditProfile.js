import React from "react";
import { Button } from "@mui/material";
import Auth from "./Auth";
import { io } from "socket.io-client";
import Form from "../Components/form";
import './EditProfile.css'

class EditProfile extends React.Component {
  constructor(props) {
    super(props);
    this.socket = io("http://localhost:3001", {
      cors: {
        origin: "http://localhost:3001",
        credentials: true,
      },
      transports: ["websocket"],
    });
    this.state = {
      newUsername: "",
    };
  }

  componentDidMount() {}

  editProfileSubmit = (data) => {
    fetch(this.props.server_url + "/api/auth/newUsername", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        res.json().then((data) => {
          alert(data.message);
          return (
            <div>
              <Auth server_url={this.props.server_url} changeScreen="auth" />
            </div>
          );
        });
      })
      .then(() => window.location.reload());
  };

  handleTextChange = (e) => {
    this.setState({ text: e.target.value });
  };

  logout = () => {
    fetch(this.props.server_url + "/api/auth/logout", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(() => {
        return (
          <div>
            <Auth server_url={this.props.server_url} changeScreen="auth" />
          </div>
        );
      })
      .then(() => window.location.reload());
  };

  render() {
    let fields = ["NewUsername"];
    let display = (
      <Form
        fields={fields}
        close={this.logout}
        type="Edit Profile Username Form"
        submit={this.editProfileSubmit}
        onChange={this.handleTextChange}
        key={"editprofile"}
      />
    );
    return (
      <div>
        <Button
          variant="contained"
          id="logout-Button"
          onClick={() => {
            fetch(this.props.server_url + "/api/auth/logout", {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then(() => {
                return (
                  <div>
                    <Auth
                      server_url={this.props.server_url}
                      changeScreen="auth"
                    />
                  </div>
                );
              })
              .then(() => window.location.reload());
          }}
        >
          Logout
        </Button>
        <div id="wrapper">
        <h1>Edit Profile Username</h1>
        {display}
        </div>
      </div>
    );
  }
}

export default EditProfile;

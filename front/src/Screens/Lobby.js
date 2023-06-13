import React from "react";
import { Button } from "@mui/material";
import Auth from "./Auth";
import { io } from "socket.io-client";
import Chatroom from "./Chatroom";
import "./Lobby.css";

class Lobby extends React.Component {
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
      username: "",
      rooms: undefined,
      screen: "",
      selectedRoom: null,
      room: "",
    };
  }

  componentDidMount() {
    fetch(this.props.server_url + "/api/rooms/all", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ rooms: data });
      });
  }

  handleRoomSelect = (room) => {
    const { username } = this.state;
    this.setState({ selectedRoom: room, screen: "chatroom" });
    this.socket.emit("join", { room, username });
  };

  handleBackToLobby = () => {
    const { selectedRoom, username } = this.state;
    this.setState({ selectedRoom: null, screen: "", username: "" });
    this.socket.emit("leave", { room: selectedRoom, username });
  };

  createRoom = (data) => {
    if (document.getElementById("room-name").value === "") {
      alert("Input for room name was empty, failed to create room.");
    } else {
      document.getElementById("room-name").value = "";
      fetch(this.props.server_url + "/api/rooms/create", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName: data }),
      }).then((res) => {
        res.json().then((data) => {
          alert(`Created room with "${data.name}" name!`);
          window.location.reload();
        });
      });
    }
  };

  joinRoom = (data) => {
    if (document.getElementById("join-room-name").value === "") {
      alert("Input for room name was empty, failed to join room.");
    } else {
      document.getElementById("join-room-name").value = "";
      fetch(this.props.server_url + "/api/rooms/join", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: this.state.username, roomName: data }),
      })
        .then((res) => res.json())
        .then((data) => {
          this.setState({ room: data.room });
          if (data.room !== undefined) {
            alert(`Joined ${data.room} room!`);
            window.location.reload();
          } else {
            alert(data.message);
          }
        });
    }
  };

  leaveRoom = (data) => {
    if (document.getElementById("leave-room-name").value === "") {
      alert("Input for room name was empty, failed to leave room.");
    } else {
      document.getElementById("leave-room-name").value = "";
      fetch(this.props.server_url + "/api/rooms/leave", {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: this.state.username, roomName: data }),
      })
        .then((res) => res.json())
        .then((data) => {
          this.setState({ room: data.room });
          if (data.room !== undefined) {
            alert(`Left ${data.room} room.`);
            window.location.reload();
          } else {
            alert(data.message);
          }
        });
    }
  };

  render() {
    const { rooms, selectedRoom, screen } = this.state;

    if (screen === "chatroom") {
      return (
        <Chatroom
          roomID={selectedRoom}
          changeScreen={this.handleBackToLobby}
          server_url={this.props.server_url}
          username={this.state.username}
        />
      );
    }

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

        <div id="manage-room-container">
          <h1>Manage Rooms</h1>
          <div id="manage-button-container">
            <div>
              <Button
                id="create-room-button"
                variant="contained"
                onClick={() => this.createRoom(this.state.room)}
              >
                Create Room
              </Button>
              <input
                className="input-design"
                type="search"
                id="room-name"
                placeholder="Enter room name to create..."
                style={{ width: "300px" }}
                onChange={(e) => {
                  this.setState({ room: e.target.value });
                }}
              ></input>
            </div>
            <div>
              <Button
                id="join-room-button"
                variant="contained"
                onClick={() => this.joinRoom(this.state.room)}
              >
                Join Room
              </Button>
              <input
                className="input-design"
                type="search"
                id="join-room-name"
                placeholder="Enter room name to join..."
                style={{ width: "300px" }}
                onChange={(e) => {
                  this.setState({ room: e.target.value });
                }}
              />
            </div>
            <div>
              <Button
                id="leave-room-button"
                variant="contained"
                onClick={() => this.leaveRoom(this.state.room)}
              >
                Leave Room
              </Button>
              <input
                className="input-design"
                type="search"
                id="leave-room-name"
                placeholder="Enter room name to leave..."
                style={{ width: "300px" }}
                onChange={(e) => {
                  this.setState({ room: e.target.value });
                }}
              />
            </div>
          </div>
        </div>
        <h1 id="lobby-header">Lobby</h1>
        <div id="lobby-container">
          {rooms ? (
            rooms.map((room) => (
              <Button
                id="room-buttons"
                variant="contained"
                key={"roomKey" + room}
                onClick={() => this.handleRoomSelect(room)}
              >
                {room}
              </Button>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    );
  }
}

export default Lobby;

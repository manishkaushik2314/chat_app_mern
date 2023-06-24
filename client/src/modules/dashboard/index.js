import React, { useEffect, useState } from "react";
import Avatar from "../../Assets/avatar.svg";
import Input from "../../components/input/index.js";
import axios, { all } from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [loggedInUser, setUser] = useState(
    JSON.parse(localStorage.getItem("userDetails"))
  );
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [typeMessage, setTypeMessage] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  console.log("set messages", messages);
  useEffect(() => {
    setSocket(io("http://localhost:8080"));

    //socket?.emit("addUser", loggedInUser.id);
    //console.log(loggedInUser.id);
  }, []);

  useEffect(() => {
    socket?.emit("addUser", loggedInUser?.id);
    socket?.on("getUsers", (users) => {
      console.log("Users from socket", users);
    });
    socket?.on("getMessage", (data) => {
      console.log("data from socket", data);
      setMessages((prev) => ({
        ...prev,
        texts: [...prev.texts, { user: loggedInUser, message: data.message }],
      }));
    });
  }, [socket]);

  useEffect(() => {
    const userLoggedIn = JSON.parse(localStorage.getItem("userDetails"));
    const fetchConversations = () => {
      axios
        .get(`http://localhost:8000/api/conversation/${userLoggedIn.id}`)
        .then((res) => {
          console.log("conversations", res.data);
          setConversations(res.data);
        });
    };
    fetchConversations();
    const fetchAllUsers = () => {
      axios
        .get(`http://localhost:8000/api/getAllUsers/${userLoggedIn.id}`)
        .then((res) => {
          //console.log("axios fetch all users", res);
          setAllUsers(res.data);
          //console.log("all users state", allUsers);
        });
    };
    fetchAllUsers();
  }, []);

  // useEffect(() => {
  //   const fetchAllUsers = async () => {
  //     const allUsersData = await fetch(
  //       `http://localhost:8000/api/getAllUsers`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     const resData = await allUsersData.json();
  //     console.log("All users from fetch", resData);
  //     setAllUsers(resData);
  //     console.log("allUsers state", allUsers);
  //   };
  //   fetchAllUsers();
  // }, []);

  const fetchMessages = (conversationId, withUser) => {
    axios
      .get(
        `http://localhost:8000/api/message/${conversationId}?senderId=${loggedInUser?.id}&&receiverId=${withUser._id}`
      )
      .then((res) => {
        console.log("fetch messages ", res.data);
        setMessages({ texts: res.data, receiver: withUser, conversationId });
      });
    //console.log("Messages state", messages);

    // .then((res) => {
    //   setMessages(res.data);
    // })
    // .catch((error) => {
    //   console.log(error);
    // });
  };

  const sendMessage = () => {
    //console.log(messages);
    socket?.emit("sendMessage", {
      conversationId: messages?.conversationId,
      senderId: loggedInUser?.id,
      message: typeMessage,
      receiverId: messages?.receiver?._id,
    });
    axios
      .post("http://localhost:8000/api/message", {
        conversationId: messages?.conversationId,
        senderId: loggedInUser?.id,
        message: typeMessage,
        receiverId: messages?.receiver?._id,
      })
      .then((res) => {
        console.log("message sent", res);
      });

    setTypeMessage("");
  };

  //console.log("messages state", messages);
  //console.log("all users state", allUsers);

  // const user = JSON.parse(localStorage.getItem("userDetails"));
  // console.log("user: ", user);

  return (
    <div className="w-screen flex">
      <div className="border border-border w-[25%] h-screen  bg-primary">
        <div className=" mx-2 flex items-center my-4">
          <img
            className="border border-primary rounded-full p-[1px]"
            src={Avatar}
            width={75}
            height={75}
            //onClick={handleImageClick()}
          />
          <div className="ml-4">
            <h3 className="text-2xl">{loggedInUser.fullName}</h3>
            <p className="text-lg font-light">My Account</p>
          </div>
        </div>
        <hr className="border border-border mx-4" />
        <div>
          <div className="my-2 ml-4 font-semibold text-secondary">Messages</div>
          <hr className="mx-4 border border-border"></hr>
          <div className=" overflow-auto">
            {conversations.length > 0 ? (
              conversations.map(({ conversationId, withUser }) => {
                return (
                  <>
                    <div className="cursor-pointer">
                      <div
                        className="flex items-center my-2 ml-2"
                        onClick={() => {
                          fetchMessages(conversationId, withUser);
                        }}
                      >
                        <img
                          className=" rounded-full "
                          src={Avatar}
                          width={50}
                          height={50}
                        />
                        <div className="ml-4">
                          <h3 className="text-lg">{withUser.fullName}</h3>
                          <p className="text-base font-semibold text-border">
                            {withUser.email}
                          </p>
                        </div>
                      </div>
                      <hr className="mx-4 border border-border"></hr>
                    </div>
                  </>
                );
              })
            ) : (
              <div className="text-center text-lg font font-semibold mt-6">
                No conversations
              </div>
            )}
          </div>
        </div>
      </div>
      <div className=" w-[50%] h-screen  bg-primary flex flex-col items-center border-r-black">
        {messages?.receiver?.fullName && (
          <div className="w-[75%] h-[80px] bg-border rounded-full mt-6 mb-6 px-6 flex items-center">
            <div className="cursor-pointer">
              <img src={Avatar} width={65} height={65}></img>
            </div>
            <div className="ml-4 mr-auto">
              <h3 className="text-xl">{messages?.receiver?.fullName}</h3>
              <p className="text-sm font-semibold text-primary">
                {messages.receiver.email}
              </p>
            </div>
            <div className="cursor-pointer">
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-phone-call"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="black"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                <path d="M15 7a2 2 0 0 1 2 2" />
                <path d="M15 3a6 6 0 0 1 6 6" />
              </svg> */}
            </div>
          </div>
        )}

        <div className="h-[75%]   border-t border-b border-border w-full overflow-auto">
          <div className="h-[1000px] px-10 py-14">
            {messages?.texts?.length > 0 ? (
              messages.texts.map(({ message, user: { id } = {} }) => {
                if (id === loggedInUser.id) {
                  return (
                    <div className="max-w-[40%] break-words bg-border rounded-b-xl rounded-tl-xl p-4 mb-6 ml-auto">
                      {message}
                    </div>
                  );
                } else {
                  return (
                    <div className="max-w-[40%] break-words bg-[#C7E9B0] rounded-b-xl rounded-tr-xl p-4 mb-6">
                      {message}
                    </div>
                  );
                }
              })
            ) : (
              <div className="text-center font-semibold">
                Please Select a Conversation
              </div>
            )}
          </div>
        </div>
        {messages?.receiver?.fullName && (
          <div className="p-5 w-full flex items-center px-3">
            <Input
              className="w-[75%] py-2"
              values={typeMessage}
              onChange={(e) => {
                setTypeMessage(e.target.value);
              }}
              inputClassName=" bg-border w-full h-10 rounded-full px-4 placeholder-black"
              placeholder="Type a message..."
              type="text"
            />

            <div className="ml-4 flex items-center ">
              <div
                className={`cursor-pointer ${
                  !typeMessage && "pointer-events-none"
                }`}
                onClick={() => {
                  sendMessage();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-send"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="#088395"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                  <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
                </svg>
              </div>

              <div
                className={`ml-4 cursor-pointer ${
                  !typeMessage && "pointer-events-none"
                }`}
              >
                {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-plus"
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="#088395"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg> */}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className=" w-[25%] h-screen bg-primary border border-border px-1 py-4">
        <hr className="mx-4 border border-border"></hr>
        <div className="my-2 ml-4 font-semibold text-secondary">People</div>
        <hr className="mx-4 border border-border"></hr>
        <div>
          {console.log("All Users", allUsers)}
          {allUsers.length > 0 ? (
            allUsers.map((users) => {
              return (
                <>
                  <div className="cursor-pointer">
                    <div
                      className="flex items-center my-2 ml-2"
                      onClick={() => {
                        fetchMessages("new", users);
                      }}
                    >
                      <img
                        className=" rounded-full "
                        src={Avatar}
                        width={50}
                        height={50}
                      />
                      <div className="ml-4">
                        <h3 className="text-lg">{users.fullName}</h3>
                        <p className="text-base font-semibold text-border">
                          {users.email}
                        </p>
                      </div>
                    </div>
                    <hr className="mx-4 border border-border"></hr>
                  </div>
                </>
              );
            })
          ) : (
            <div className="text-center text-lg font font-semibold mt-6">
              No conversations
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

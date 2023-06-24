const express = require("express");

const app = express();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const io = require("socket.io")(8080, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//connecting to db
require("./connection");

//importing files of db
const Users = require("./models/Users");
const Conversation = require("./models/conversation");
const Messages = require("./models/Messages");

//app use
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 8000;

//routes
app.get("/", (req, res) => {
  res.send("Welcome");
});

//socket.io
let users = [];
io.on("connection", (socket) => {
  console.log("Connected to socket");
  console.log("Socket id :", socket.id);
  socket.on("addUser", (id) => {
    console.log("user id from frontend", id);
    const isUserExists = users.find((user) => {
      user.userId === id;
    });
    console.log("isUserExists ", isUserExists);
    if (!isUserExists) {
      const user = { userId: id, socketId: socket.id };
      users.push(user);
      //console.log(users);
      io.emit("getUsers", users);
    }
    console.log(users);
    // socket.userId = userId;
    // io.emit("getUsers", socket.userId);
  });

  socket.on(
    "sendMessage",
    ({ senderId, receiverId, message, conversationId }) => {
      // console.log("data from send message", senderId);
      // console.log("data from send message", receiverId);
      // console.log("data from send message", message);
      // console.log("data from send message", conversationId);
      console.log("users in socket", users);
      const receiver = users.find((user) => {
        user.userId === receiverId;
      });
      console.log("receiver: ", receiver);
      if (receiver) {
        io.to(receiver.userId).emit("getMessage", {
          senderId,
          receiverId,
          message,
          conversationId,
        });
      }
    }
  );

  socket.on("disconnect", () => {
    users = users.filter((user) => {
      user.socketId !== socket.id;
    });
    io.emit("getUsers", users);
  });
});

app.post("/api/register", async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).send("Please Enter all details");
    } else {
      const isAlreadyExists = await Users.findOne({ email });
      if (isAlreadyExists) {
        res.status(400).send("Email already Exists");
      } else {
        const newUser = new Users({ fullName, email });
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          newUser.set("password", hashedPassword);
          newUser.save();
          next();
        });
        return res.status(200).send("User registered Successfully!");
      }
    }
  } catch (error) {
    console.log(error, "Error");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send("Please Enter all details");
    } else {
      const user = await Users.findOne({ email });
      if (!user) {
        res.status(400).send("Email is incorrect!");
      } else {
        const validateUser = await bcrypt.compare(password, user.password);
        if (!validateUser) {
          res.status(400).send("Password is incorrect");
        } else {
          const payload = {
            userId: user._id,
            email: user.email,
          };
          const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "MonkeyDLuffy";
          jwt.sign(
            payload,
            JWT_SECRET_KEY,
            { expiresIn: 86400 },
            async (err, token) => {
              await Users.updateOne({ _id: user._id }, { $set: { token } });

              user.save();
              return res.status(200).json({
                user: {
                  id: user._id,
                  email: user.email,
                  fullName: user.fullName,
                },
                token: token,
              });
            }
            //next()
          );
        }
      }
    }
  } catch (error) {
    console.log(error, "Error");
  }
});

app.post("/api/conversation", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    //console.log(req.body);

    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });

    await newConversation.save();
    res.status(200).send("Conversation created successfully!");
  } catch (error) {
    console.log(error, "Error");
  }
});

app.get("/api/conversation/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    });

    const conversationUserData = Promise.all(
      conversations.map(async (conversation) => {
        const receiverId = conversation.members.find(
          (member) => member !== userId
        );
        const user = await Users.findById(receiverId);
        return {
          withUser: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
          },
          conversationId: conversation._id,
        };
      })
    );
    res.status(200).json(await conversationUserData);
  } catch (error) {
    console.log(error, "Error");
  }
});

app.post("/api/message", async (req, res) => {
  try {
    const { conversationId, senderId, message, receiverId } = req.body;
    console.log(
      "inside post api of making conversation",
      conversationId,
      senderId,
      message,
      receiverId
    );
    if (!senderId || !message) {
      return res.status(400).send("Please fill all fields!");
    }
    if (conversationId === "new") {
      const checkConversation = await Conversation.find({
        members: { $all: [senderId, receiverId] },
      });
      if (checkConversation?.length > 0) {
        const newMessage = new Messages({
          conversationId: checkConversation[0]._id.valueOf(),
          senderId,
          message,
        });
        await newMessage.save();
        res.status(200).send("Message sent successfully!");
      } else {
        const newConversation = new Conversation({
          members: [senderId, receiverId],
        });
        await newConversation.save();
        const newMessage = new Messages({
          conversationId: newConversation._id,
          senderId,
          message,
        });
        await newMessage.save();
        return res.status(200).send("Message sent successfully");
      }
    } else {
      const newMessage = new Messages({
        conversationId: conversationId,
        senderId,
        message,
      });
      await newMessage.save();
      return res.status(200).send("Message sent successfully");
    }

    // if (conversationId === "new" && receiverId) {
    //   const newConversation = new Conversation({
    //     members: [senderId, receiverId],
    //   });
    //   await newConversation.save();
    //   const newMessage = new Messages({
    //     conversationId: newConversation._id,
    //     senderId,
    //     message,
    //   });
    //   await newMessage.save();
    //   return res.status(200).send("Message sent successfully");
    // } else if (!conversationId && !receiverId) {
    //   return res.status(400).send("Please fill all the fields!");
    // }
    // const newMessage = new Messages({ conversationId, senderId, message });
    // await newMessage.save();
    // res.status(200).send("Message sent successfully!");
  } catch (error) {
    console.log("Error", error);
  }
});

app.get("/api/message/:conversationId", async (req, res) => {
  try {
    const checkMessages = async (conversationId) => {
      //console.log("Inside checkmessages conversation id", conversationId);
      const messages = await Messages.find({ conversationId });
      //console.log("messages: ", messages);
      const messageSenderData = Promise.all(
        messages.map(async (message) => {
          const user = await Users.findById(message.senderId);
          return {
            user: { id: user._id, fullName: user.fullName, email: user.email },
            message: message.message,
          };
        })
      );
      res.status(200).json(await messageSenderData);
    };
    const conversationId = req.params.conversationId;
    //console.log("Conversation id: ", conversationId);
    // console.log("Query Sender Id: ", req.query.senderId);
    // console.log("Query ReceiverId: ", req.query.receiverId);
    if (conversationId === "new") {
      const checkConversation = await Conversation.find({
        members: { $all: [req.query.senderId, req.query.receiverId] },
      });
      //console.log(checkConversation);
      // console.log("Query Sender Id: ", req.query.senderId);
      // console.log("Query ReceiverId: ", req.query.receiverId);
      // console.log("Check conversation ", checkConversation);
      // console.log("Conversation id: ", checkConversation[0]?._id.valueOf());
      if (checkConversation?.length > 0) {
        checkMessages(checkConversation[0]._id.valueOf());
      } else {
        res.status(200).json([]);
      }
    } else {
      checkMessages(conversationId);
    }
  } catch (error) {
    console.log("Error", error);
  }
});

app.get("/api/getAllUsers/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const allUsers = await Users.find({ _id: { $ne: userId } });
    //console.log(allUsers);

    res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
  }
});
//server
app.listen(port, () => {
  console.log("Listening on port " + port);
});

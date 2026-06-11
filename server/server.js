const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Post = require("./models/post");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/socialnetwork")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

io.on("connection", socket => {

    console.log("User Connected");

    socket.on("getPosts", async () => {
        const posts = await Post.find().sort({ createdAt: -1 });
        socket.emit("loadPosts", posts);
    });

socket.on("newPost", async (data) => {
    const newPost = new Post({
        user: data.user,
        text: data.text,
        likes: 0,
        comments: []
    });

    await newPost.save();

    io.emit("postAdded", newPost);
});

    socket.on("likePost", async (postId) => {
        const post = await Post.findById(postId);
        post.likes += 1;
        await post.save();

        io.emit("postUpdated", post);
    });

    socket.on("commentPost", async ({ postId, comment }) => {
        const post = await Post.findById(postId);

        post.comments.push(comment);

        await post.save();

        io.emit("postUpdated", post);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected");
    });

});

app.get("/", (req,res)=>{
    res.send("Server Running");
});

server.listen(5000, ()=>{
    console.log("Server started on port 5000");
});

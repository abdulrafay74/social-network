const socket = io("http://localhost:5000");

const postsDiv = document.getElementById("posts");

socket.emit("getPosts");

socket.on("loadPosts", posts => {
    postsDiv.innerHTML = "";
    posts.forEach(addPost);
});

function createPost() {

    const text = document.getElementById("postInput").value;

    if (!text.trim()) return;

    socket.emit("newPost", {
        user: "Rafay",
        text
    });

    document.getElementById("postInput").value = "";
}

socket.on("postAdded", post => {
    addPost(post);
});

socket.on("postUpdated", post => {
    const old = document.getElementById(post._id);
    if (old) old.remove();
    addPost(post);
});

function addPost(post) {

    const div = document.createElement("div");

    div.className = "post";
    div.id = post._id;

    div.innerHTML = `
        <h3>${post.user}</h3>
        <p>${post.text}</p>
        <button onclick="likePost('${post._id}')">Like (${post.likes})</button>
        <button onclick="commentPost('${post._id}')">Comment</button>
    `;

    postsDiv.prepend(div);
}

function likePost(id) {
    socket.emit("likePost", id);
}

function commentPost(id) {
    const text = prompt("Enter comment:");
    if (!text) return;

    socket.emit("commentPost", {
        postId: id,
        comment: {
            user: "Rafay",
            text
        }
    });
}
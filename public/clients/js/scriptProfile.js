const socket = io();
let data_user = null;

const fetchAPI = async (url, method, body = null) => {
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null
    });
    return await res.json();
}

const checkAuthen = async () => {
    const user = await fetchAPI("http://localhost:3000/api/authentication", "GET");
    if (user.error) {
        window.location.href = "index.html";
    }
}

window.onload = async () => {
    checkAuthen();
    displayProfile();
}

const displayProfile = async () => {
    const data = await fetchAPI("http://localhost:3000/api/authentication", "GET");
    data_user = data;
    const user = await fetchAPI(`http://localhost:3000/api/users/${data._id}`, "GET");
    const nameText = document.getElementById("name-text");
    const avt = document.getElementById("avatar-image");
    const follower = document.getElementById("follower");
    const liked = document.getElementById("like");
    const disliked = document.getElementById("dislike");
    follower.textContent = user.follower;
    liked.textContent = user.liked;
    disliked.textContent = user.disliked;
    avt.src = user.avatar;
    nameText.textContent = user.name;
}

const showInputAndButtons = () => {
    document.getElementById("open-message").style.display = "block";
}

const updateAvatar = async (event) => {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = async function (e) {
        const formData = new FormData();
        formData.append('avatar', file);
        fetch(`http://localhost:3000/api/users/upload-avatar/${data_user._id}`, {
            method: 'POST',
            body: formData
        }).then(res => res.json())
            .then(data => {
                if (data.error) {
                    swal({
                        title: "Error!",
                        text: "file is not support",
                        icon: "error",
                        button: "OK",
                    });
                } else {
                    document.getElementById("avatar-image").src = e.target.result;
                    swal({
                        title: "Success!",
                        text: "Upload avatar successfully",
                        icon: "success",
                        button: "OK",
                    });
                }
            });
    }
    reader.readAsDataURL(file);
    displayProfile();
}

const editName = () => {
    const nameText = document.getElementById("name-text");
    const nameInput = document.getElementById("name-input");
    const btnSave = document.getElementById("btn-save");
    btnSave.classList.remove("d-none");
    nameInput.value = nameText.textContent;
    nameText.classList.add("d-none");
    nameInput.classList.remove("d-none");
    nameInput.focus();
}

const saveName = async () => {
    const nameText = document.getElementById("name-text");
    const nameInput = document.getElementById("name-input");
    const btnSave = document.getElementById("btn-save");
    nameText.textContent = nameInput.value;
    nameText.classList.remove("d-none");
    nameInput.classList.add("d-none");
    btnSave.classList.add("d-none");
    fetchAPI(`http://localhost:3000/api/users/${data_user._id}`, "PUT", { name: nameInput.value })
        .then((data) => {
            if (data && data.error) {
                swal({
                    title: "Error!",
                    text: data.error,
                    icon: "error",
                    button: "OK",
                });
            }
        });
}

const logout = async () => {
    if (Clerk.user) {
        await Clerk.signOut();
    }
    const data = await fetchAPI("http://localhost:3000/api/users/logout", "GET");
    if (data.error) {
        swal({
            title: "Error!",
            text: data.error,
            icon: "error",
            button: "OK",
        });
    }
    else {
        window.location.href = "index.html";
    }
}

document.getElementById("join-room").addEventListener("click", async (e) => {
    const room = document.getElementById("id-room").value;
    fetchAPI(`http://localhost:3000/api/room`, "POST", { room })
});
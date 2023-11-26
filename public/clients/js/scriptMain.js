const socket = io();

let currentUser = null;
const APIkey = "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";
const sound_joinRoom = new Audio("../../sounds/sound_joinRoom.mp3");
const sound_closeRoom = new Audio("../../sounds/sound_closeRoom.wav");
// sidebar menu
const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle"),
    searchBtn = body.querySelector(".search-box"),
    modeSwitch = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text"),
    searchBox = document.querySelector('.search-box input'),
    menuLinks = document.querySelector('.menu-links');

const fetchAPI = async (url, method, body = null) => {
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null
    });
    return await res.json();
}

const removeCookies = async () => {
    return await fetchAPI("http://localhost:3000/api/users/logout", "GET");
}

const logoutToMain = async () => {
    if (Clerk.user) {
        await Clerk.signOut();
    }
    const data = await removeCookies();
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

const saveMessage = async (message, userId, roomId, isLinkLocation, time) => {
    await fetchAPI("http://localhost:3000/api/message", "POST", { message, userId, roomId, isLinkLocation, time });
}

const createDate = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = `${now.getFullYear()}-${month}-${now.getDate()} ${time}`;
    return date;
}

const queryString = location.search;
const params = Qs.parse(queryString, { ignoreQueryPrefix: true });
const room = params['id-room'];
socket.emit("join-room", { idRoom: room });

const setRoom = async () => {
    const user = await fetchAPI("http://localhost:3000/api/authentication", "GET");
    if (user.error) {
        window.location.href = "index.html";
        return;
    }
    const val = await fetchAPI(`http://localhost:3000/api/room/roomNumber/${room}`, "GET");
    await fetchAPI(`http://localhost:3000/api/users/${user._id}`, "PUT", { roomId: val._id });
    currentUser = await fetchAPI(`http://localhost:3000/api/users/${user._id}`, "GET");
    const titleRoom = document.getElementById('number_room');
    titleRoom.textContent = `Room ${val.roomNumber}`;
}

window.onload = async () => {
    await setRoom();
    await getAllMessageByIdRoom();
    socket.emit("set-socketId", { idUser: currentUser._id });
    socket.emit("get-all-user-in-room");
};


socket.on("new-user-join", async () => {
    sound_joinRoom.play();
})

socket.on("allMember", (allUsersInRoom) => {
    displayUserInRoom(allUsersInRoom);
})

socket.on("user_disconnect", async (allUsersInRoom) => {
    sound_closeRoom.play();
    displayUserInRoom(allUsersInRoom);
})

socket.on("send-message", async ({ message, infoUser }) => {
    isLeft = infoUser._id !== currentUser._id;
    chat(infoUser.avatar, infoUser.name, message, isLeft);
});

socket.on("send-location", async ({ lat, lng, infoUser }) => {
    const linkLocation = `https://www.google.com/maps?q=${lat},${lng}`;
    isLeft = infoUser._id !== currentUser._id;
    chat(infoUser.avatar, infoUser.name, linkLocation, isLeft);
});

document
    .getElementById("send-message")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const message = document.getElementById("content-message").value;
        if (message === "") return;
        const date = createDate();
        await saveMessage(message, currentUser._id, currentUser.roomId, date);
        socket.emit("send-message", { message, infoUser: { _id: currentUser._id, name: currentUser.name, avatar: currentUser.avatar } });
        document.getElementById("content-message").value = "";
    });

document.getElementById("btn-location").addEventListener("click", async function (e) {
    e.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const message = `https://www.google.com/maps?q=${lat},${lng}`;
            const date = createDate();
            await saveMessage(message, currentUser._id, currentUser.roomId, date);
            socket.emit("send-location", { lat, lng, infoUser: { _id: currentUser._id, name: currentUser.name, avatar: currentUser.avatar } });
        });
    } else {
        swal({
            title: "Error!",
            text: "Your browser does not support Geolocation",
            icon: "error",
            button: "OK",
        });
    }
});

const displayUserInRoom = async (allUsersInRoom) => {
    let ul = document.querySelector('.menu-links');
    let s = "";
    allUsersInRoom.forEach((data) => {
        s += `<li class="nav-link view-profile" data-user-view="${currentUser._id}" data-user-id="${data._id}">
                <a href="#">
                    <img class='bx icon' src="${data.avatar}" alt="">
                    <span class="text nav-text">${data.name}</span>
                </a>
            </li>`;
    });
    ul.innerHTML = s;

    const viewProfiles = document.querySelectorAll('.view-profile');
    viewProfiles.forEach((profile) => {
        profile.addEventListener('click', function () {
            const userId = this.dataset.userId;
            const idUserView = this.dataset.userView;
            window.location.href = `view_profile.html?userId=${userId}&&idUserView=${idUserView}`;
        });
    });
}

const getAllMessageByIdRoom = async () => {
    const chatbox = document.querySelector('.chat__conversation-board');
    chatbox.innerHTML = '';

    // Lấy tất cả các tin nhắn từ phòng chat
    fetchAPI(`http://localhost:3000/api/message/roomNumber/${currentUser.roomId}`, "GET").then((data) => {
        data.forEach((mess) => {
            const m = mess.userId;
            chat(m.avatar, m.name, mess.message, m._id !== currentUser._id);
        });
    });
}

const backToProfile = async () => {
    window.location.href = "profile.html";
}

const reloadMessage = async () => {
    await getAllMessageByIdRoom();
}

const hideMessage = async () => {
    const chatbox = document.querySelector('.chat__conversation-board');
    chatbox.innerHTML = "";
}

const chat = async (avatar, nameUser, message, isLeft) => {
    let div = document.createElement('div');
    if (isLeft) {
        div.className = 'chat__conversation-board__message-container';
    } else {
        div.className = 'chat__conversation-board__message-container reversed';
    }
    const urlRegex = /^https?:\/\//;
    if (urlRegex.test(message)) {
        div.innerHTML += `<div class="chat__conversation-board__message__person">
                        <div class="chat__conversation-board__message__person__avatar"><img src="${avatar}" alt=${nameUser}/></div><span class="chat__conversation-board__message__person__nickname">${nameUser}</span>
                    </div>
                    <div class="chat__conversation-board__message__context">
                        <div class="chat__conversation-board__message__bubble"> <a href="${message}">${nameUser}'s Location</a></div>
                    </div>`;
    } else {
        div.innerHTML += `<div class="chat__conversation-board__message__person">
                        <div class="chat__conversation-board__message__person__avatar"><img src="${avatar}" alt=${nameUser}/></div><span class="chat__conversation-board__message__person__nickname">${nameUser}</span>
                    </div>
                    <div class="chat__conversation-board__message__context">
                        <div class="chat__conversation-board__message__bubble"> 
                        <span>${message}</span></div>
                    </div>`;
    }
    div.innerHTML += `</div>
    <div class="chat__conversation-board__message__options">
        <button class="btn-icon chat__conversation-board__message__option-button option-item emoji-button">
        <svg class="feather feather-smile sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
        </button>
        <button class="btn-icon chat__conversation-board__message__option-button option-item more-button">
        <svg class="feather feather-more-horizontal sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
        </svg>
        </button>
    </div>`;
    const chatbox = document.querySelector('.chat__conversation-board');
    chatbox.appendChild(div);
    scrollToBottom();
}

searchBox.addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    for (const li of menuLinks.children) {
        const navText = li.querySelector('.nav-text');
        if (navText.textContent.toLowerCase().includes(searchText)) {
            li.style.display = '';
        } else {
            li.style.display = 'none';
        }
    }
});

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
})

searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
})

modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
        modeText.innerText = "Light mode";
    } else {
        modeText.innerText = "Dark mode";
    }
});

function scrollToBottom() {
    var chatConversationBoard = document.querySelector('#chat__conversation-board');
    chatConversationBoard.scrollTop = chatConversationBoard.scrollHeight;
}
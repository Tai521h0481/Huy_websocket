const icon_like = document.querySelector('.icon-like');
const icon_dislike = document.querySelector('.icon-dislike');
const icon_follow = document.querySelector('.icon-follow');
const nameText = document.getElementById("name-text");
const avt = document.getElementById("avatar-image");
const follower = document.getElementById("follower");
const liked = document.getElementById("like");
const disliked = document.getElementById("dislike");
let isLiked = -1;
let isDisliked = -1;
let isFollowed = -1;

const url = new URL(window.location.href);
const userId = url.searchParams.get('userId');
const idUserView = url.searchParams.get('idUserView');
window.onload = async () => {
    if(userId === idUserView) {
        window.location.href = `http://localhost:3000/public/clients/dist/profile.html`;
    }
    else {
        const user = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json());
        follower.textContent = user.follower;
        liked.textContent = user.liked;
        disliked.textContent = user.disliked;
        avt.src = user.avatar;
        nameText.textContent = user.name;
    }
}

const updateReaction = async () => {
    await fetch(`http://localhost:3000/api/users/updateReaction/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            liked: liked.textContent,
            disliked: disliked.textContent,
            follower: follower.textContent
        }),
    });
}

const handleClick = (icon, class1, class2, isToggled, textContent) => {
    icon.addEventListener('click', async event => {
        event.target.classList.toggle(class1);
        event.target.classList.toggle(class2);
        isToggled.value = -isToggled.value;
        textContent.textContent = parseInt(textContent.textContent) + isToggled.value;
        await updateReaction();
    });
}

handleClick(icon_like, 'bx-like', 'bxs-like', {value: isLiked}, liked);
handleClick(icon_dislike, 'bx-dislike', 'bxs-dislike', {value: isDisliked}, disliked);
handleClick(icon_follow, 'bx-user-pin', 'bxs-user-pin', {value: isFollowed}, follower);

const backToChatRoom = () => {
    window.history.back();
}
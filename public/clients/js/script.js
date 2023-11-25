document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("logemail").value;
  const password = document.getElementById("logpass").value;
  logInFunction(email, password);
});


document
  .getElementById("register-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("regname").value;
    const email = document.getElementById("regemail").value;
    const password = document.getElementById("regpass").value;
    await fetch("http://localhost:3000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          swal({
            title: "Error!",
            text: data.error,
            icon: "error",
            button: "OK",
          });
        } else {
          saveLocalStorage(email, password);
          swal({
            title: "Register success!",
            text: "Welcome to our website!",
            icon: "success",
            button: "OK",
          });
        }
      });
  });

const fillInLogin = () => {
  const email = localStorage.getItem("email");
  const password = localStorage.getItem("password");
  document.getElementById("logemail").value = email;
  document.getElementById("logpass").value = password;
}

const fetchAPI = async (url, method, body = null) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null
  });
  return await res.json();
}

const logInFunction = (email, password) => {
  fetchAPI("http://localhost:3000/api/users/login", "POST", { email, password })
    .then(data => {
      if (data.error) {
        swal({
          title: "Error!",
          text: data.error,
          icon: "error",
          button: "OK",
        });
      } else {
        localStorage.setItem('token', data.token);
        window.location.href = "profile.html";
      }
    });
}

const hashCode = (s) => {
  var hash = 0, i, chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

window.onload = () => {
  Clerk.load().then(async () => {
    if (Clerk.user) {
      const email = Clerk.user.primaryEmailAddress.emailAddress;
      const id = hashCode(email);
      const name = Clerk.user.username;
      const password = 'secretKey1234';
      const avatar = Clerk.user.profileImageUrl;
      await fetchAPI("http://localhost:3000/api/users/register", "POST", {id, name, email, password, avatar })
      logInFunction(email, password);
    }
  });
}

const saveLocalStorage = (email, password) => {
  localStorage.setItem("email", email);
  localStorage.setItem("password", password);
  fillInLogin();
}
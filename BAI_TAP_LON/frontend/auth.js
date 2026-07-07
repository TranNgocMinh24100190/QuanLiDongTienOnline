const API = "http://localhost:3000/api";

async function login() {

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    if (email == "" || password == "") {

        alert("Vui lòng nhập đầy đủ thông tin");

        return;

    }

    try {

        const res = await fetch(API + "/auth/login", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email,

                password

            })

        });

        const data = await res.json();

        if (res.ok) {

            localStorage.setItem("token", data.token);

            alert("Đăng nhập thành công");

            window.location = "dashboard.html";

        } else {

            alert(data.message || "Sai tài khoản hoặc mật khẩu");

        }

    } catch (err) {

        alert("Không thể kết nối tới Server");

    }

}

async function register() {

    const fullname = document.getElementById("fullname").value;

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    const confirm = document.getElementById("confirm").value;

    if (fullname == "" || email == "" || password == "" || confirm == "") {

        alert("Không được để trống");

        return;

    }

    if (password != confirm) {

        alert("Mật khẩu không khớp");

        return;

    }

    try {

        const res = await fetch(API + "/auth/register", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                fullname,

                email,

                password

            })

        });

        const data = await res.json();

        if (res.ok) {

            alert("Đăng ký thành công");

            window.location = "login.html";

        } else {

            alert(data.message || "Đăng ký thất bại");

        }

    } catch (err) {

        alert("Không thể kết nối Server");

    }

}

function logout() {

    localStorage.removeItem("token");

    window.location = "login.html";

}
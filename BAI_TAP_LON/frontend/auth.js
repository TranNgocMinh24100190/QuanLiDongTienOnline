const API = "http://localhost:3000/api/auth/login";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    try {

        const response = await fetch(API, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email,

                password

            })

        });

        const data = await response.json();

        if (response.ok) {

            alert("Đăng nhập thành công");

            localStorage.setItem("token", data.token);

            window.location.href = "dashboard.html";

        } else {

            alert(data.message || "Sai tài khoản hoặc mật khẩu");

        }

    } catch (err) {

        alert("Không kết nối được tới server");

        console.log(err);

    }

});
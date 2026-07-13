const API="http://localhost:3000/api/auth/register";

const form=document.getElementById("registerForm");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const fullname=document.getElementById("fullname").value;

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

const confirm=document.getElementById("confirm").value;

if(password!==confirm){

alert("Mật khẩu không khớp");

return;

}

try{

const res=await fetch(API,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

name:fullname,

email,

password

})

});

const data=await res.json();

if(res.ok){

alert("Đăng ký thành công");

location.href="login.html";

}else{

alert(data.message);

}

}catch(err){

alert("Không kết nối được server");

}

});
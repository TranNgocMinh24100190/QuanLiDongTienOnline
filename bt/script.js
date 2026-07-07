// Ví dụ fetch dữ liệu từ backend
fetch("http://localhost:5000/api/users")
  .then(res => res.json())
  .then(data => {
    const content = document.getElementById("content");
    let table = "<table><tr><th>Name</th><th>ID</th><th>Status</th></tr>";
    data.forEach(u => {
      table += `<tr><td>${u.name}</td><td>${u.id}</td><td>${u.status}</td></tr>`;
    });
    table += "</table>";
    content.innerHTML = table;
  })
  .catch(err => console.error(err));

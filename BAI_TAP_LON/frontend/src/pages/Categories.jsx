import React, { useEffect, useState } from "react";
import { getCategories } from "../api/categories";
import Navbar from "../components/Navbar";

function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch {
        alert("Không tải được danh mục!");
      }
    };
    fetchCategories();
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Danh mục chi tiêu</h2>
      <ul>
        {categories.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Categories;

import React, { useEffect, useState } from "react";

import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../api/categories";

import "../styles/Layouts.css";
import "../styles/Tables.css";
import "../styles/Forms.css";

function Categories() {
  const [categories, setCategories] = useState([]);

  const [category_name, setCategoryName] =
    useState("");

  const [type, setType] =
    useState("Expense");

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data);
    } catch {
      alert("Không tải được danh mục!");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    try {
      await createCategory({
        name: category_name,
        type,
      });

      setCategoryName("");
      loadCategories();

    } catch (err) {
      alert(
        err?.response?.data?.message
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert(
        err?.response?.data?.message
      );
    }
  };

  return (
    <div className="main-content">

      <div className="page-header">
        <h1 className="page-title">
          Danh mục
        </h1>
      </div>

      <div className="card">
        <h2 className="card-title">
          Thêm danh mục
        </h2>

        <div className="category-form">

          <input className="form-input"
            type="text"
            placeholder="Tên danh mục"
            value={category_name}
            onChange={(e) =>
              setCategoryName(
                e.target.value
              )
            }
          />

          <br />
          <br />

          <select className="form-select"
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
          >
            <option value="Expense">
              Expense
            </option>

            <option value="Income">
              Income
            </option>
          </select>

          <br />
          <br />

          <button className="form-button"
            onClick={handleCreate}
          >
            Tạo
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          Danh sách danh mục
        </h2>

        {Array.isArray(categories) && categories.filter((c) => !c.is_system).map((c) => (
          <div
            key={c.category_id}
            className="stat-card"
          >
            <h3>
              {c.category_name}
            </h3>

            <p>{c.type}</p>

            {!c.is_system && (
              <button
                className="btn btn-danger"
                onClick={() =>
                  handleDelete(
                    c.category_id
                  )
                }
              >
                Xóa
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

export default Categories;
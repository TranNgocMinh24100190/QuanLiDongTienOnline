import React, { useEffect, useState } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";

import "../styles/Layouts.css";
import "../styles/Tables.css";
import "../styles/Forms.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [category_name, setCategoryName] = useState("");
  const [type, setType] = useState("Expense");

  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

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

  const handleUpdate = async () => {
    try {
      await updateCategory(editingCategory.category_id, {
        name: editCategoryName,
      });
      setEditingCategory(null);
      setEditCategoryName("");
      loadCategories();
    } catch (err) {
      alert(
        err?.response?.data?.message || "Không thể cập nhật danh mục"
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
              <div className="card-actions"
                style={{ marginTop: "15px", display: "flex", gap: "50px" }}>
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    handleDelete(c.category_id)
                  }
                >
                  Xóa
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingCategory(c);
                    setEditCategoryName(c.category_name);
                  }}
                >
                  Sửa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {editingCategory && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Sửa Danh Mục</h2>
            <input
              className="form-input"
              type="text"
              placeholder="Tên danh mục"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn btn-danger"
                onClick={() => setEditingCategory(null)}
              >
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
class User {
  constructor(data = {}) {
    this.user_id = data.user_id ?? null;
    this.full_name = data.full_name ?? "";
    this.email = data.email ?? "";
    this.password_hash = data.password_hash ?? "";
    this.phone = data.phone ?? null;
    this.role = data.role ?? "USER";
    this.created_at = data.created_at ?? null;
    this.updated_at = data.updated_at ?? null;
  }

  isAdmin() {
    return this.role === "ADMIN";
  }

  toJSON() {
    return {
      user_id: this.user_id,
      full_name: this.full_name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = User;
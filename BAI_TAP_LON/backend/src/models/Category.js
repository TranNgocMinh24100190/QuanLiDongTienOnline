class Category {
  constructor(data) {
    this.category_id = data.category_id;
    this.user_id = data.user_id;
    this.category_name = data.category_name;
    this.type = data.type;
    this.is_system = Boolean(data.is_system);
  }

  isIncome() {
    return this.type === "Income";
  }

  isExpense() {
    return this.type === "Expense";
  }

  isSystemCategory() {
    return this.is_system;
  }
}

module.exports = Category;
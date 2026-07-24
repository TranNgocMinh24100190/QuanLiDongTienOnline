class Budget {
  constructor(data = {}) {
    this.budget_id = data.budget_id ?? null;
    this.user_id = data.user_id ?? null;
    this.category_id = data.category_id ?? null;

    this.amount_limit = Number(data.amount_limit ?? 0);
    this.month = Number(data.month ?? 0);
    this.year = Number(data.year ?? 0);

    this.category_name = data.category_name ?? "";

    this.spent = Number(data.spent ?? 0);
    this.remaining = Number(data.remaining ?? 0);
    this.overspent = Number(data.overspent ?? 0);
    this.status = data.status || "SAFE";
  }

  isExceeded() {
    return this.status === "EXCEEDED";
  }

  isFull() {
    return this.status === "FULL";
  }
}

module.exports = Budget;
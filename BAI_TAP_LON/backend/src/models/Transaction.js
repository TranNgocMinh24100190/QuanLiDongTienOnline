class Transaction {
  constructor(data = {}) {
    this.transaction_id = data.transaction_id ?? null;
    this.wallet_id = data.wallet_id ?? null;
    this.category_id = data.category_id ?? null;
    this.amount = Number(data.amount ?? 0);
    this.transaction_type = data.transaction_type ?? null;
    this.description = data.description ?? "";
    this.transaction_date = data.transaction_date ?? null;
    this.created_at = data.created_at ?? null;

    // dùng khi controller join Wallets
    this.wallet_name = data.wallet_name ?? null;

    // các cột bổ sung trong DB
    this.is_transfer = this._coerceBoolean(data.is_transfer);
    this.is_reversed = this._coerceBoolean(data.is_reversed);
    this.transfer_group_id = data.transfer_group_id ?? null;

    // nếu có join user
    this.user_id = data.user_id ?? null;
  }

  _coerceBoolean(value) {
    return value === true || value === 1 || value === "1";
  }

  isIncome() {
    return this.transaction_type === "Income";
  }

  isExpense() {
    return this.transaction_type === "Expense";
  }

  isTransfer() {
    return this.is_transfer;
  }

  isReversed() {
    return this.is_reversed;
  }

  isReversible() {
    return !this.is_reversed && !this.is_transfer;
  }

  toJSON() {
    return {
      transaction_id: this.transaction_id,
      wallet_id: this.wallet_id,
      category_id: this.category_id,
      amount: this.amount,
      transaction_type: this.transaction_type,
      description: this.description,
      transaction_date: this.transaction_date,
      created_at: this.created_at,
      wallet_name: this.wallet_name,
      is_transfer: this.is_transfer,
      is_reversed: this.is_reversed,
      transfer_group_id: this.transfer_group_id,
      user_id: this.user_id
    };
  }
}

module.exports = Transaction;
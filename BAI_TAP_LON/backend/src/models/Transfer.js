class Transfer {
  constructor(data = {}) {
    this.transfer_id = data.transfer_id ?? null;
    this.from_wallet_id = data.from_wallet_id ?? null;
    this.to_wallet_id = data.to_wallet_id ?? null;
    this.amount = Number(data.amount ?? 0);
    this.transfer_date = data.transfer_date ?? null;
    this.note = data.note ?? "";

    // dùng cho response
    this.from_wallet_name = data.from_wallet_name ?? "";
    this.to_wallet_name = data.to_wallet_name ?? "";
    this.from_transaction_id = data.from_transaction_id ?? null;
    this.to_transaction_id = data.to_transaction_id ?? null;
    this.transfer_group_id = data.transfer_group_id ?? null;
    this.is_reversed = this._coerceBoolean(data.is_reversed);
  }

  _coerceBoolean(value) {
    return value === true || value === 1 || value === "1";
  }

  toJSON() {
    return {
      transfer_id: this.transfer_id,
      from_wallet_id: this.from_wallet_id,
      to_wallet_id: this.to_wallet_id,
      amount: this.amount,
      transfer_date: this.transfer_date,
      note: this.note,
      from_wallet_name: this.from_wallet_name,
      to_wallet_name: this.to_wallet_name,
      from_transaction_id: this.from_transaction_id,
      to_transaction_id: this.to_transaction_id,
      transfer_group_id: this.transfer_group_id,
      is_reversed: this.is_reversed
    };
  }
}

module.exports = Transfer;
class Wallet {
  constructor(data = {}) {
    this.wallet_id = data.wallet_id ?? null;
    this.user_id = data.user_id ?? null;
    this.wallet_name = data.wallet_name ?? "";
    this.wallet_type = data.wallet_type ?? "";
    this.balance = Number(data.balance ?? 0);
    this.created_at = data.created_at ?? null;
    this.status = data.status ?? "ACTIVE";
    this.closed_at = data.closed_at ?? null;
  }

  isActive() {
    return this.status === "ACTIVE";
  }

  isClosed() {
    return this.status === "CLOSED";
  }

  toJSON() {
    return {
      wallet_id: this.wallet_id,
      user_id: this.user_id,
      wallet_name: this.wallet_name,
      wallet_type: this.wallet_type,
      balance: this.balance,
      created_at: this.created_at,
      status: this.status,
      closed_at: this.closed_at
    };
  }
}

module.exports = Wallet;
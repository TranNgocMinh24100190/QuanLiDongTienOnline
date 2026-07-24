class Goal {
  constructor(data = {}) {
    this.goal_id = data.goal_id ?? null;
    this.user_id = data.user_id ?? null;
    this.goal_name = data.goal_name ?? "";
    this.target_amount = Number(data.target_amount ?? 0);
    this.current_amount = Number(data.current_amount ?? 0);
    this.target_date = data.target_date ?? null;
  }

  isCompleted() {
    return Number(this.current_amount) >= Number(this.target_amount);
  }

  getProgressPercent() {
    if (!this.target_amount || this.target_amount <= 0) return 0;
    return Math.min(100, Math.round((this.current_amount / this.target_amount) * 100));
  }
}

module.exports = Goal;
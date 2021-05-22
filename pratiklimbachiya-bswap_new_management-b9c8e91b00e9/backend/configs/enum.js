const enumData = {};

enumData.TxStatus = ["pending", "completed", "onhold", "cancelled", "not_initaited"];

enumData.TxStatusObject = {
  pending: "pending",
  completed: "completed",
  onhold: "onhold",
  cancelled: "cancelled",
  not_initaited: "not_initaited"
};

module.exports = enumData;

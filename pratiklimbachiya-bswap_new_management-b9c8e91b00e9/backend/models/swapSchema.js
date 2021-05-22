"use strict";
const enumData = require('../configs/enum');

const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
require("mongoose-uuid2")(mongoose);
var UUID = mongoose.Types.UUID;
const { v4: uuidv4 } = require("uuid");

var SwapTxSchema = new Schema(
  {
    _id: { type: UUID, default: uuidv4 },
    txId: { type: String, trim: true, unique: true },
    tokenA: { type: String, trim: true },
    tokenB: { type: String, trim: true },
    user: { type: String, trim: true, lowercase: true },
    amountA: { type: String, default: 0 },
    amountB: { type: String, default: 0 },
    amountARedeemed: { type: String, default: 0 },
    isInvestment: { type: Boolean, default: false },
    txTime: { type: Number, default: 0 },
    txStatus: { type: String, default: "pending", enum: enumData.TxStatus },
    claimedTxId: { type: String, trim: true },
    claimedTxStatus: { type: String, default: "not_initaited", enum: enumData.TxStatus },
    claimApproveTxId: { type: String, trim: true },
    claimApproveTxStatus: { type: String, default: "not_initaited", enum: enumData.TxStatus },
    isExchangeInvestment: { type: Boolean, default: false },
    exchangeAddress: { type: String, trim: true, lowercase: true },
    isWhitelisted: { type: Boolean, default: false },
    whitelistTxId: { type: String, trim: true },
    whitelistTxStatus: { type: String, default: "not_initaited", enum: enumData.TxStatus },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      virtuals: true,
    },
  }
);

const SwapTxModel = mongoose.model("SwapTx", SwapTxSchema);

module.exports = { SwapTxModel: SwapTxModel };

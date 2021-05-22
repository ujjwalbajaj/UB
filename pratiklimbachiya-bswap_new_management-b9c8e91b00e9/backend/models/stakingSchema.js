"use strict";
const enumData = require('../configs/enum');

const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
require("mongoose-uuid2")(mongoose);
var UUID = mongoose.Types.UUID;
const { v4: uuidv4 } = require("uuid");

var stakingOptionsSchema = new Schema(
  {
    _id: { type: UUID, default: uuidv4 },
    type: { type: String, required: true },
    token: { type: String, trim: true },
    amount: { type: String, default: "0" },
    stakingOptions: { type: Array }
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      virtuals: true,
    },
  }
);

var userStakingSchema = new Schema(
  {
    _id: { type: UUID, default: uuidv4 },
    orderIds: { type: String, trim: true },
    user: { type: String },
    stakeToken: { type: String, trim: true },
    stakeAmount: { type: String, default: 0 },
    rewardToken: { type: String, trim: true },
    rewardAmount: { type: String, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      virtuals: true,
    },
  }
);

const StakingOptionModel = mongoose.model("StakingOption", stakingOptionsSchema);
const UserStakingModel = mongoose.model("UserStaking", userStakingSchema);

module.exports = { StakingOptionModel: StakingOptionModel, UserStakingModel: UserStakingModel };

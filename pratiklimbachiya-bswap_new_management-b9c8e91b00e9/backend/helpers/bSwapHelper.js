// const { web3 } = require("../configs");

const { StakingOptionModel, UserStakingModel } = require("../models").stakingSchema;
const { TxStatusObject } = require("../configs/enum");
const bSwapHelper = {};

bSwapHelper.getStakingOptions = async function (next) {
  try {
    let stakingOptions = await StakingOptionModel.find({});
    if (stakingOptions) {
      return stakingOptions;
    } else {
      return "No any staking option records found!";
    }
  } catch (err) {
    console.log(err);
    return "error in getting staking option records";
  }
};

bSwapHelper.getUserStakings = function (userAddress, next) {
  UserStakingModel.find({
    user: userAddress.toLowerCase(),
  })
    .then(function (response) {
      next(response.reverse(), null);
    })
    .catch(function (e) {
      next(null, e);
    });
};

// add new records
bSwapHelper.addNewStakingOption = async (data, next) => {
  try {
    const addNewRecord = new StakingOptionModel({
      type: data.type,
      token: data.token,
      amount: data.amount,
      stakingOptions: data.stakingOptions
    });

    const saveRecords = await addNewRecord.save();

    next(
      {
        resp_code: 0,
        resp_message: "Record Added Successfully",
      },
      null
    );
  } catch (err) {
    next(null, err);
  }
};

// swap cron
bSwapHelper.getMatchingDetails = async (req, res) => {
  try {
    const fetchDetails = await SwapTxModel.find({
      isInvestment: false,
    }).sort({ createdAt: 1 });

    if (fetchDetails.length) {
      for (let i = 0; i < fetchDetails.length; i++) {
        // check whether completed or not

        const isCompleted = await SwapTxModel.findById(fetchDetails[i]._id, {
          isInvestment: 1,
        });

        if (!isCompleted.isInvestment) {
          const checkMatchingBalance = await SwapTxModel.findOne({
            amountA: fetchDetails[i].amountA,
            isInvestment: false,
            _id: { $ne: fetchDetails[i]._id },
          });

          if (checkMatchingBalance) {
            // check date who has createdt the transaction firstly and call the api and change the data in database to completed.
            console.log("MATCHING BALANCE FOUND");
          }
        }
      }
      return res.send({
        message: "SMART SWAP SCHEDULAR FIRED SUCCESSFULLY",
      });
    }
    return res.send({
      message: "No data Found",
    });
  } catch (err) {
    return res
      .status(400)
      .send({ resp_code: -1, message: "error in getting smart swap data" });
  }
};

// get transactionlist whose transaction is pending
bSwapHelper.getTransactionList = async () => {
  try {
    const fetchTransactionList = await SwapTxModel.find({
      $or: [
        {
          isInvestment: true,
          txStatus: TxStatusObject.pending,
          claimedTxStatus: TxStatusObject.not_initaited,
          claimApproveTxStatus: TxStatusObject.not_initaited,
        },
        {
          isInvestment: true,
          txStatus: TxStatusObject.completed,
          claimedTxStatus: TxStatusObject.completed,
          claimApproveTxStatus: TxStatusObject.pending,
        },
      ],
    }).sort({ createdAt: 1 });

    if (fetchTransactionList.length) {
      // for (let i = 0; i < fetchTransactionList.length; i++) {
      // do the operation and update the transaction status

      // update transaction according to transaction status
      // const updateTx = {
      //   txStatus: TxStatusObject.completed,
      // };

      // // update the records
      // const updateTxRecord = await SwapTxModel.updateOne(
      //   { _id: fetchTransactionList[i]._id },
      //   updateTx
      // );
      // }
      // return "Swap transaction cron fired successfully";
      // console.log("fetc",fetchTransactionList);
      return fetchTransactionList[0];
    } else {
      // return res.send({
      //   message: "No Transaction in in pending state",
      // });
      // console.log("NO TRSNACTION FOUND");
      return null;
    }
  } catch (err) {
    return "error in getting smart swap data";
  }
};

// check any pending transaction is there or not
bSwapHelper.checkAnyTransactionIsPending = async (address, next) => {
  try {
    const getTransactionDetails = await SwapTxModel.findOne({
      user: address.toLowerCase(),
      $or: [
        { txStatus: TxStatusObject.pending },
        {
          claimedTxStatus: {
            $in: [TxStatusObject.pending, TxStatusObject.not_initaited],
          },
        },
        {
          claimApproveTxStatus: {
            $in: [TxStatusObject.pending, TxStatusObject.not_initaited],
          },
        },
      ],
    });

    if (getTransactionDetails) {
      next(
        {
          resp_code: 1,
          status: true,
        },
        null
      );
    } else {
      next(
        {
          resp_code: 1,
          status: false,
        },
        null
      );
    }
  } catch (err) {
    next(null, err);
  }
};

// get transactionlist whose transaction is pending
bSwapHelper.updateTxDetails = async (id, updateData) => {
  try {
    const fetchTransaction = await SwapTxModel.findOne({
      _id: id,
    });
    console.log("I am here 1 -------------------------------------");
    if (fetchTransaction) {
      console.log("I am here 2 -------------------------------------");
      // for (let i = 0; i < fetchTransactionList.length; i++) {
      // do the operation and update the transaction status

      const updateTxRecord = await SwapTxModel.updateOne(
        { _id: fetchTransaction._id },
        updateData
      );
      console.log("I am here 3 -------------------------------------");
      // return "Swap transaction cron fired successfully";
      return fetchTransaction;
    } else {
      console.log("I am here 4 -------------------------------------");
      // return res.send({
      //   message: "No Transaction in in pending state",
      // });
      console.log("NO TRSNACTION FOUND");
      return "No Transaction in pending state";
    }
  } catch (err) {
    console.log(err);
    console.log("I am here 5 -------------------------------------");
    return "error in getting smart swap data";
  }
};

module.exports = bSwapHelper;
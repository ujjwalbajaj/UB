const {
    bSwapHelper
} = require('../helpers');
const swapController = {}

swapController.getTxHistory = function (address, next) {
    swapHelper.getTxHistory(address, function (response, error) {
        next(response, error);
    })
}

swapController.updateTxHistory = function (data, next) {
    swapHelper.updateTxHistory(data, next);
}

// add new swap record
swapController.addNewStakingOption = function (data, next) {
    bSwapHelper.addNewStakingOption(data, next)
}


//fetch transaction that are in pending
swapController.fetchTransactionList = function () {
    swapHelper.getTransactionList();
}

// check any pending transaction is there or not
swapController.checkPendingTransaction = (address, next) => {
    swapHelper.checkAnyTransactionIsPending(address, next);
}

module.exports = swapController;
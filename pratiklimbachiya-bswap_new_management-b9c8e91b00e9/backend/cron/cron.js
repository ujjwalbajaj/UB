const cron = require("node-cron");
const { swapHelper } = require("../helpers");

// cron.schedule("* * * * *", (req, res) => {
//   console.log("get pending cron called");
//   swapHelper.getTransactionList(req, res);
// });

// // match transaction cron

// cron.schedule("* * * * *", (req, res) => {
//   console.log("get matching  cron called");
//   swapHelper.getMatchingDetails(req, res);
// });
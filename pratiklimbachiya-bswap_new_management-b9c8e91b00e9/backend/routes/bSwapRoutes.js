const express = require("express");
const bSmartSwapRoutes = express.Router();
const { Validator } = require("node-input-validator");
const { bSwapController } = require("../controller");
const { bSwapHelper } = require("../helpers");

// add new staking option record
bSmartSwapRoutes.post("/createOption", (req, res) => {
  const v = new Validator(req.body, {
    type: "required",
    token: "required",
    amount: "required",
    stakingOptions: "required"
  });

  v.check()
    .then((matched) => {
      if (!matched) {
        return res.status(422).send(v.errors);
      } else {
        bSwapController.addNewStakingOption(req.body, (response, error) => {
          if (error) {
            return res
              .status(400)
              .send({ resp_code: -1, data: error.toString() });
          } else {
            return res.send({
              response,
            });
          }
        });
      }
    })
    .catch((e) => {
      return res.status(400).send({ resp_code: -1, data: e.toString() });
    });
});

bSmartSwapRoutes.get("/getStakingOptions", async (req, res) => {
  return res.send({
    "data": await bSwapHelper.getStakingOptions(req, res)
  });
});

module.exports = bSmartSwapRoutes;

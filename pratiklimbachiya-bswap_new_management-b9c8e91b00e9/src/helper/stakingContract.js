import {
    EventEmitter
} from "events";
import web3Js from 'web3';
import { ethers } from 'ethers';

import stakingAbi from "../abis/stakingAbi.json";
import tokenAbi from "../abis/tokenAbi.json";
import gateWayAbi from "../abis/gateWayAbi.json";
import constantConfig from "../config/constantConfig";
var BigNumber = require('big-number');

// const ADRESS_ONE = "0x0000000000000000000000000000000000000001";
// const ADRESS_TWO = "0x0000000000000000000000000000000000000002";

class StakingContract extends EventEmitter {

    constructor(web3, networkId) {
        super();
        this.web3 = web3;
        this.networkId = networkId;
        this.stakingAddress = constantConfig[networkId].stakingContract;
        this.stakingInstance = new ethers.Contract(
            this.stakingAddress,
            stakingAbi,
            web3.getSigner(0)
        );
    }

    async getApprovedTokenForStaking(userAddress, tokenAddress, stakingContractAddress) {
        let web3 = this.web3;
        this.tokenInstance = new ethers.Contract(
            tokenAddress,
            tokenAbi,
            web3.getSigner(0)
        );

        let balance = await this.tokenInstance.allowance(userAddress, stakingContractAddress);
        return web3Js.utils.fromWei(balance._hex);
    }

    async approveJNTRTokenForSwapFactory(tokenAddress, stakingContractAddress, txCb, receiptCb) {
        let web3 = this.web3;
        this.tokenInstance = new ethers.Contract(
            tokenAddress,
            tokenAbi,
            web3.getSigner(0)
        );
        let highApproval = web3Js.utils.toWei("10000000000000");
        let payload = await this.tokenInstance.populateTransaction.approve(stakingContractAddress, highApproval);
        this.sendTransaction(payload.data, 0, "150000", tokenAddress, txCb, receiptCb);
    }

    async sendTransaction(payload, value, gasLimit, to, txCb, receiptCb) {
        let gasPrice = "0";
        if (this.networkId === 56 || this.networkId === 97)
            gasPrice = "20";
        else {
            const response = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
            const json = await response.json();
            gasPrice = (json.fast / 10).toString();
        }

        const tx = {
            to: to,
            data: payload,
            gasPrice: web3Js.utils.toHex(web3Js.utils.toWei(gasPrice, "gwei")),
            gasLimit: web3Js.utils.toHex(gasLimit),
            value: web3Js.utils.toHex(value)
        };

        this.web3.getSigner(0).sendTransaction(tx).then(result => {
            txCb(result.hash)
            result.wait().then(async (receipt) => {
                receiptCb(receipt);
            })
        }).catch(error => {
            console.log(error);
        });
    }

    async stakeToken(optionId, amount, txCb, receiptCb) {
        let payload = await this.stakingInstance.populateTransaction.stake(optionId, amount);
        this.sendTransaction(payload.data, 0, "350000", this.stakingAddress, txCb, receiptCb)
    }

    async launchPool(token, amount, stackTokens, period, rate, txCb, receiptCb) {
        let payload = await this.stakingInstance.populateTransaction.createBonus(token, amount, stackTokens, period, rate);
        this.sendTransaction(payload.data, 0, "3000000", this.stakingAddress, txCb, receiptCb)
    }

    handleActions(action) {
        switch (action.type) { }
    }

}





export default StakingContract;
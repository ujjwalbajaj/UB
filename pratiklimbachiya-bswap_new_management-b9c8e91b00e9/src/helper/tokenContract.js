import {
    EventEmitter
} from "events";
import web3Js from 'web3';
import { ethers } from 'ethers';

import tokenAbi from "../abis/tokenAbi.json";


var BigNumber = require('big-number');

// const ADRESS_ONE = "0x0000000000000000000000000000000000000001";
// const ADRESS_TWO = "0x0000000000000000000000000000000000000002";

class TokenContract extends EventEmitter {

    constructor(web3, networkId) {
        super();
        this.web3 = web3;
        this.networkId = networkId;
    }

    async getBalance(userAddress) {
        let balance = await this.frozenInstance.balanceOf(userAddress);
        return web3Js.utils.fromWei(balance._hex);
    }

    async transferToken(tokenAddress, recepientAddress, tokenAmount, txCb, receiptCb) {
        this.tokenInstance = new ethers.Contract(
            tokenAddress,
            tokenAbi,
            this.web3.getSigner(0)
        );
        let payload = await this.tokenInstance.populateTransaction.transfer(recepientAddress, web3Js.utils.toWei(tokenAmount));
        this.sendTransaction(payload.data, 0, "800000", tokenAddress, txCb, receiptCb);
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

    handleActions(action) {
        switch (action.type) { }
    }

}





export default TokenContract;
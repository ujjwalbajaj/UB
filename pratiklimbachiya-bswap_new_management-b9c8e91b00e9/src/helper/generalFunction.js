
import { isValidAddress } from 'ethereumjs-util';
import { ethers } from 'ethers';
import web3Js from 'web3';
import tokenAbi from "../abis/tokenAbi.json";
import notificationConfig from "../config/notificationConfig";
import decimalConfig from "../config/decimalConfig";
import web3Config from '../config/web3Config';
import BigNumber from 'big-number/big-number';

export async function checkAddress(web3, tokenAddress) {
    let isAddressValid = false;
    try {
        isAddressValid = isValidAddress(tokenAddress);
    } catch (e) { }
    if (!isAddressValid) {
        notificationConfig.info("Please Enter Proper Address");
        return 0;
    }

    let tokenInstance = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        web3.getSigner(0)
    );

    let isAddressToken = false;

    try {
        let name = await tokenInstance.name();
        console.log(name)
        //   let symbol = await tokenInstance.symbol();
        let decimal = await tokenInstance.decimals();
        decimal = web3Js.utils.hexToNumber(decimal._hex);
        isAddressToken = true;
        return decimalConfig[decimal.toString()];
    } catch (e) { }
    if (!isAddressToken) {
        notificationConfig.info(
            "Could not find this bep-20 token please check address"
        );
        return 0;
    }
}

export async function getApproved(web3, tokenAddress, userAddress, spenderAddress) {
    let isAddressValidToken = false, isAddressValidUser = false, isAddressValidSpender = false;
    try {
        isAddressValidToken = isValidAddress(tokenAddress);
        isAddressValidUser = isValidAddress(userAddress);
        isAddressValidSpender = isValidAddress(spenderAddress);
    } catch (e) { }
    if (!isAddressValidToken) {
        notificationConfig.info("Please Enter Proper Token Address");
        return 0;
    }
    if (!isAddressValidUser) {
        notificationConfig.info("Please Enter Proper User Address");
        return 0;
    }
    if (!isAddressValidSpender) {
        notificationConfig.info("Please Enter Proper Spender Address");
        return 0;
    }

    let tokenInstance = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        web3.getSigner(0)
    );

    let isAddressToken = false;

    try {
        let approved = await tokenInstance.allowance(userAddress, spenderAddress);
        approved = web3Js.utils.fromWei(approved._hex);
        isAddressToken = true;
        return approved;
    } catch (e) {
        console.log(e)
    }
    if (!isAddressToken) {
        notificationConfig.info(
            "Could not find this bep-20 token please check address"
        );
        return 0;
    }
}

export async function approveToken(web3, tokenAddress, userAddress, spenderAddress, amount, txCb, receiptCb, errorCb) {
    let isAddressValidToken = false, isAddressValidUser = false, isAddressValidSpender = false;
    try {
        isAddressValidToken = isValidAddress(tokenAddress);
        isAddressValidUser = isValidAddress(userAddress);
        isAddressValidSpender = isValidAddress(spenderAddress);
    } catch (e) { }
    if (!isAddressValidToken) {
        errorCb("Please Enter Proper Token Address");
    }
    if (!isAddressValidUser) {
        errorCb("Please Enter Proper User Address");
    }
    if (!isAddressValidSpender) {
        errorCb("Please Enter Proper Spender Address");
    }
    if (amount === "" || amount === 0 || amount <= 0) {
        errorCb("Please Enter Valid Amount");
    }

    let tokenInstance = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        web3.getSigner(0)
    );

    try {
        let payload = await tokenInstance.populateTransaction.approve(spenderAddress, web3Js.utils.toWei(amount));
        sendTransaction(payload.data, 0, "150000", tokenAddress, txCb, receiptCb);
    } catch (e) { }
}

async function sendTransaction(payload, value, gasLimit, to, txCb, receiptCb) {
    let gasPrice = "0";
    if (web3Config.getNetworkId() === 56 || web3Config.getNetworkId() === 97)
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

    web3Config.getWeb3().getSigner(0).sendTransaction(tx).then(result => {
        txCb(result.hash)
        result.wait().then(async (receipt) => {
            receiptCb(receipt);
        })
    }).catch(error => {
        console.log(error);
    });
}
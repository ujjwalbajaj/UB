import * as CommonAction from './CommonActions'
import CONSTANT from '../constants'

const baseUrl = CONSTANT.API_URL;

export function fetchStakingOptions() {
    const route = CONSTANT.API_URL + '/getStakingOptions'
    CommonAction.SEND_GET_REQUEST(route, "FETCH_STAKING_OPTIONS");
}

export function createOption(txData) {
    const route = CONSTANT.API_URL + '/createOption';
    CommonAction.SEND_POST_REQUEST(route, txData, "CREATE_STAKING_OPTION");
}
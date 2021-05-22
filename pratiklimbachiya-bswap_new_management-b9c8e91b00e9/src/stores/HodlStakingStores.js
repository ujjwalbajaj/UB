import { EventEmitter } from "events";
import dispatcher from "../dispatcher";

class HodlStakingStores extends EventEmitter {

    constructor() {
        super();
        this.fetchedStakingOptions = null;
        this.createStakingOptionsResponse = null;
    }

    setFetchedStakingOptions(respCode, respData) {
        // console.log(respData)
        if (respCode === 1) {
            this.fetchedStakingOptions = respData.data;
        }
        this.emit("FETCH_STAKING_OPTIONS");
    }

    setCreateStakingOptions(respCode, respData) {
        // console.log(respData)
        if (respCode === 1) {
            this.createStakingOptionsResponse = respData.data;
        }
        this.emit("CREATE_STAKING_OPTION");
    }

    getStakingOptions() {
        return this.fetchedStakingOptions;
    }

    getCreateStakingOptionsResponse() {
        return this.createStakingOptionsResponse;
    }


    handleActions(action) {
        switch (action.type) {
            case "FETCH_STAKING_OPTIONS": {
                this.setFetchedStakingOptions(action.resp_code, action.data)
                break;
            }

            case "CREATE_STAKING_OPTION": {
                this.setCreateStakingOptions(action.resp_code, action.data)
                break;
            }

            default: {
            }
        }
    }
}
const hodlStakingStores = new HodlStakingStores();
dispatcher.register(hodlStakingStores.handleActions.bind(hodlStakingStores));

export default hodlStakingStores;
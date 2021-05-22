import { event } from 'jquery';
import React, { PureComponent } from 'react';
import IDOFormInputs from './idoFormInputs';
import web3 from 'web3';
import {
  checkAddress,
  getApproved,
  approveToken,
} from '../helper/generalFunction';
import web3Config from '../config/web3Config';
import constantConfig from '../config/constantConfig';
import notificationConfig from '../config/notificationConfig';

const $ = window.$;

export default class IDOForm extends PureComponent {
  constructor(props) {
    super();
    this.updateStake = this.updateStake.bind(this);
    this.state = {
      termStakingList: props.termStakingList,
      token: '',
      amount: 0,
      selectedId: 0,
      amountSend: '',
      idoFormData: [],
      decimalCheck: 'ether',
      tokenApproved: 0,
    };
  }

  componentWillReceiveProps(nextProps) {}

  async handleChange(e) {
    let { id, value } = e.target;
    let { web3 } = this.props;
    if (id === 'token') {
      if ((await checkAddress(web3, value)) !== 0) {
        let approved = await getApproved(
          web3,
          value,
          web3Config.getAddress(),
          constantConfig[web3Config.getNetworkId()].stakingContract
        );
        this.setState({ tokenApproved: approved });
      }
    }
    this.setState(
      {
        [id]: value,
      },
      () => {
        this.forceUpdate();
      }
    );
  }

  floatOnly = async (event) => {
    if (event.shiftKey === true) event.preventDefault();

    var code = event.keyCode;

    if (
      (code >= 48 && code <= 57) ||
      (code >= 96 && code <= 105) ||
      code === 8 ||
      code === 9 ||
      code === 37 ||
      code === 39 ||
      code === 46 ||
      code === 190 ||
      code === 110
    ) {
      // allowed characters
    } else event.preventDefault();

    if (
      event.target.value.indexOf('.') !== -1 &&
      (code === 190 || code === 110)
    )
      event.preventDefault();
  };

  async clearValue(e) {
    let { id } = e.target;
    this.setState(
      {
        [id]: '',
      },
      () => {
        this.forceUpdate();
      }
    );
  }

  updateStake(selectedData) {
    this.setState({
      selectedId: selectedData,
    });
  }

  updateAmount(e) {
    this.setState({
      amountSend: e.target.value,
    });
  }

  async approve() {
    let { web3 } = this.props;
    let networkId = web3Config.getNetworkId();
    let address = web3Config.getAddress();

    if (web3 === null) return 0;

    approveToken(
      web3,
      this.state.token,
      address,
      constantConfig[web3Config.getNetworkId()].stakingContract,
      this.state.amount,
      (hash) => {
        this.setState({
          approveLoading: true,
        });
      },
      (receipt) => {
        this.setState({
          approveLoading: false,
        });
        notificationConfig.success('Approve Success');
      },
      (error) => {
        notificationConfig.info(error);
      }
    );
  }

  async createPoolLocal() {
    // if (this.state.amountSend === "" || this.state.amountSend === 0) {
    //     notificationConfig.warning("Enter valid amount!");
    // } else {
    // token, amount, stackTokens, period, rate

    let { token, amount, idoFormData, decimalCheck } = this.state;

    if ((await checkAddress(this.props.web3, token)) === 0) {
    } else {
      let stackTokens = [];
      let period = [];
      let rate = [];
      let stakingOptions = [];

      for (let i = 0; i < idoFormData.length; i++) {
        console.log(idoFormData[i]);
        stackTokens.push(idoFormData[i].stackToken);
        period.push(idoFormData[i].period * 86400);
        rate.push(idoFormData[i].rate * 100);
        stakingOptions.push({
          optionId: '',
          stackTokens: idoFormData[i].stackToken,
          period: idoFormData[i].period * 86400,
          rate: idoFormData[i].rate * 100,
        });
      }

      this.props.createPool(
        token,
        amount,
        stackTokens,
        period,
        rate,
        stakingOptions
      );
    }
    // }
  }

  handleData(data) {
    this.setState({ idoFormData: data });
  }

  render() {
    return (
      <div className="form1 mypopup">
        <div className="container">
          {this.props.web3 === null ? (
            <a
              href="javascript:void(0)"
              onClick={() => this.props.connectWallet()}
              className="comssBTN"
            >
              Connect wallet
            </a>
          ) : (
            <div className="content">
              <h2 className="press white size-24 txtcenter normal-weight launchpool">
                {' '}
                Launch your HODL token pool{' '}
              </h2>

              <form action="">
                <div className="npInputMbox">
                  <div className="main-input-group">
                    <p className="white plexmono medium-weight  size-18">
                      Place here the reward token smart contract address
                      <span className="icon-question"></span>
                    </p>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="0x3c037c4c2296f280bb318d725d0b454b76c199b9"
                        id="token"
                        value={this.state.token}
                        onChange={this.handleChange.bind(this)}
                        onFocus={this.clearValue.bind(this)}
                        autoComplete="off"
                      />
                      <p className="sidetxt size-18 white plexmono">
                        {this.state.stakingToken}
                      </p>
                    </div>
                  </div>

                  <div className="main-input-group">
                    <p className="white plexmono medium-weight  size-18">
                      Place here the reward token smart contract address
                      <span className="icon-question"></span>
                    </p>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder=""
                        id="amount"
                        value={this.state.amount}
                        onChange={this.handleChange.bind(this)}
                        onFocus={this.clearValue.bind(this)}
                        onKeyDown={(e) => this.floatOnly(e)}
                        autoComplete="off"
                      />
                      <p className="sidetxt size-18 white plexmono">
                        {this.state.stakingToken}
                      </p>
                    </div>
                  </div>
                </div>

                <IDOFormInputs
                  handleData={this.handleData.bind(this)}
                  web3={this.props.web3}
                ></IDOFormInputs>

                <div className="select-values">
                  <p className="size-18 plexmono white txtcenter">
                    select your creation fee structure{' '}
                  </p>
                  <div className="input-1">
                    <input type="radio" id="input1" name="radio" />
                    <span className="span-input"></span>
                    <label htmlFor="input1" className="plexmono">
                      $1000 + 0% reward fee
                    </label>
                  </div>
                  <div className="input-2">
                    <input type="radio" id="input2" name="radio" />
                    <span className="span-input"></span>
                    <label htmlFor="input2" className="plexmono">
                      $500 + 25% reward fee
                    </label>
                  </div>

                  <div className="input-3">
                    <input type="radio" id="input3" name="radio" />
                    <span className="span-input"></span>
                    <label htmlFor="input3" className="plexmono">
                      $0 + 50% reward fee
                    </label>
                  </div>

                  <div className="input-4">
                    <input type="radio" id="input4" name="radio" />
                    <span className="span-input"></span>
                    <label htmlFor="input4" className="plexmono">
                      100% FREE when reward with bSWAP
                    </label>
                  </div>
                </div>

                {Number(this.state.tokenApproved) >=
                Number(this.state.amount) ? (
                  <div className="launch-pool">
                    <button
                      type="button"
                      onClick={this.createPoolLocal.bind(this)}
                    >
                      Launch Your HODL Token Pool
                    </button>
                    <img src="imgs/Layer-6181.png" alt="" />
                  </div>
                ) : (
                  <div className="launch-pool">
                    <button type="button" onClick={this.approve.bind(this)}>
                      Approve Token Transfer
                    </button>
                  </div>
                )}
                <p className="last-txt">
                  In order to launch an HODL pool you must have on bSWAP a pool
                  between [token] and BNB with at least $10,000 total
                  liquidity,or choose to reward with bSWAP
                </p>
              </form>
            </div>
          )}
        </div>
        <div
          className="closeformbtn Btn-to-close-popup"
          data-attribute="mypopup"
        >
          <img src="imgs/x-shape.png" alt="" />
        </div>
      </div>
    );
  }
}

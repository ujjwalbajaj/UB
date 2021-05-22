import React, { PureComponent } from 'react';
import Web3 from 'web3';
import notificationConfig from '../config/notificationConfig';

const $ = window.$;

const selectDropDownList = [
  {
    description: 'HODL',
    selected: true,
    value: 0,
  },
  {
    description: 'locked LP',
    selected: false,
    value: 1,
  },
  {
    description: 'Forging',
    selected: false,
    value: 2,
  },
  {
    description: 'Burn',
    selected: false,
    value: 3,
  },
  {
    description: 'Farming',
    selected: false,
    value: 4,
  },
  {
    description: 'Welcome Bonus',
    selected: false,
    value: 5,
  },
];

const tokenList = [
  {
    name: 'Binance',
  },
  {
    name: 'ETH',
  },
];
export default class Popup extends PureComponent {
  constructor(props) {
    super();
    this.updateStake = this.updateStake.bind(this);
    this.state = {
      termStakingList: props.termStakingList,
      popupData: {
        token: 'JNTR/b',
        stakingAmount: 0.0,
        id: 0,
        rewardAPY: 0.0,
        rewardDays: 1,
      },
      selectedId: 0,
      amountSend: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.termStakingList !== nextProps.termStakingList) {
      this.setState(
        {
          termStakingList: nextProps.termStakingList,
        },
        () => {
          this.updateDaysSelect();
          this.forceUpdate();
        }
      );
    }

    if (
      this.state.popupData.id !== nextProps.popupData.id ||
      this.state.popupData.id !== this.state.selectedId
    ) {
      this.setState(
        {
          popupData: nextProps.popupData,
          selectedId: nextProps.popupData.id,
        },
        () => {
          this.updateDaysSelect();
          this.forceUpdate();
        }
      );
    }
  }

  updateDaysSelect() {
    let { termStakingList, popupData } = this.state;

    // alert(popupData.token)

    $('#jntr-select').ddslick('destroy');
    $('#demo-htmlselect').ddslick('destroy');
    let daySelectIn = [];

    for (let i = 0; i < termStakingList.length; i++) {
      if (i === popupData.id) {
        daySelectIn.push({
          description: termStakingList[i][0] / 86400 + ' Days ',
          selected: true,
          value: i,
        });
      } else {
        daySelectIn.push({
          description: termStakingList[i][0] / 86400 + ' Days ',
          selected: false,
          value: i,
        });
      }
    }
    $('#jntr-select').ddslick({
      data: [
        {
          description: popupData.token,
          selected: true,
          value: 0,
          imagesrc: 'imgs/jntr-coins/jnyr-b.png',
        },
      ],
      onSelected: function (selectedData) {
        //callback function: do something with selectedData;
      },
    });

    $('#demo-htmlselect').ddslick({
      data: daySelectIn,
      onSelected: function (selectedData) {
        this.updateStake(selectedData.selectedData.value);
      }.bind(this),
    });
    $('#Hodl-select').ddslick({
      data: [
        {
          description: 'HODL',
          selected: true,
          value: 0,
        },
        {
          description: 'locked LP',
          selected: false,
          value: 1,
        },
        {
          description: 'Forging',
          selected: false,
          value: 2,
        },
        {
          description: 'Burn',
          selected: false,
          value: 3,
        },
        {
          description: 'Farming',
          selected: false,
          value: 4,
        },
        {
          description: 'Welcome Bonus',
          selected: false,
          value: 5,
        },
      ],
    });
    $('#reward-token').ddslick({});
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

  stakeTokenLocal() {
    if (this.state.amountSend === '' || this.state.amountSend === 0) {
      notificationConfig.warning('Enter valid amount!');
    } else {
      this.props.stakeToken(this.state.selectedId, this.state.amountSend);
    }
  }

  render() {
    return (
      <div className="mainpopup">
        <div className="content-popup">
          <div className="form-content">
            <div className="part0">
              <div className="input-label">
                <p className="label">Staking Pool</p>
              </div>

              <div className="input-group">
                <select id="Hodl-select">
                  <option value={'Select'}>Select</option>

                  {/* {selectDropDownList &&
                    selectDropDownList.map((data, i) => {
                      return (
                        <option key={i} value={data.description}>
                          {data.description}
                        </option>
                      );
                    })} */}
                </select>
              </div>
            </div>
            <div className="part1">
              <div className="input-label">
                <p className="label">Token</p>
              </div>

              <div className="input-group">
                <select id="jntr-select">
                  <option value={'Select'}>Select</option>

                  {/* {tokenList &&
                    tokenList.map((data, i) => {
                      return (
                        <option key={i} value={data.name}>
                          {data.name}
                        </option>
                      );
                    })} */}
                </select>
              </div>
            </div>
            <div className="part-token">
              <div className="input-label">
                <p className="label">Reward Token</p>
              </div>

              {/* <div className="input-group">
                <select id="reward-token">
                  <option
                    value="0"
                    // data-imagesrc="imgs/brackets.png"
                    data-description="bSWAP"
                  ></option>

                  <option
                    value="1"
                    // data-imagesrc="imgs/brackets.png"
                    data-description="bSWAP"
                  ></option>

                  <option
                    value="2"
                    // data-imagesrc="imgs/brackets.png"
                    data-description="bSWAP"
                  ></option>

                  <option
                    value="3"
                    // data-imagesrc="imgs/brackets.png"
                    data-description="bSWAP"
                  ></option>
                </select>
              </div> */}
            </div>

            <div className="part2">
              <div className="input-label">
                <p className="label">Your Staking</p>
                <div className="stakemax">
                  <input type="checkbox" id="checkstakemax" />
                  <span className="span-check"></span>
                  <label htmlFor="checkstakemax" className="stakeheading">
                    stake max
                  </label>
                </div>
              </div>
              <div className="input-group">
                <p className="usdlabel">
                  <span>$</span>
                  <span>usd</span>
                </p>
                <input
                  type="text"
                  placeholder="100,000"
                  value={this.state.amountSend}
                  onChange={this.updateAmount.bind(this)}
                />
                <div className="code">
                  <img src="imgs/jntr-coins/parcode.png" alt="" />
                  <span>[1,000 {this.state.popupData.token}]</span>
                </div>
              </div>
            </div>
            <div className="part3">
              <div className="input-label">
                <p className="label">Period</p>
              </div>
              <div className="input-group">
                <select
                  id="demo-htmlselect"
                  onChange={() => this.updateStake()}
                >
                  <option value={'Select'}>Select</option>
                  {/* <option value={20}>20</option>
                  <option value={30}>30</option> */}
                </select>
              </div>
            </div>
            <div className="part4">
              <div className="input-label">
                <p className="label">Rewards</p>
              </div>
              <div className="input-group">
                <p className="txtreward">
                  {this.state.termStakingList.length > 0
                    ? Web3.utils.fromWei(
                        this.state.termStakingList[this.state.selectedId][1]
                      )
                    : 0}
                  % APY
                </p>
              </div>
            </div>
          </div>
          <div className="part5">
            <button type="submit" onClick={this.stakeTokenLocal.bind(this)}>
              stake now
            </button>
          </div>

          <div className="closebtn">
            <span className="icon-x"></span>
          </div>
        </div>
      </div>
    );
  }
}

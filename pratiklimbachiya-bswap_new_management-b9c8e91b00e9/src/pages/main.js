import React, { PureComponent, lazy, Suspense } from 'react';
import { Redirect } from 'react-router-dom';
import Web3 from 'web3';
import web3Config from '../config/web3Config';
import constantConfig from '../config/constantConfig';
import stakingAbi from '../abis/stakingAbi.json';
import tokenAbi from '../abis/tokenAbi.json';
import CONSTANT from '../constants';
import notificationConfig from '../config/notificationConfig';
import Button from '../components/button';
import Popup from '../components/popup';
import StakingContract from '../helper/stakingContract';
import IDOForm from '../components/idoForm';
import TokenContract from '../helper/tokenContract';
import * as HodlStakingActions from '../actions/HodlStakingActions';
import HodlStakingStores from '../stores/HodlStakingStores';
import { ethers } from 'ethers';

const $ = window.$;
export default class Main extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      web3: null,
      btnClick: false,
      instanceStakingBinance: null,
      instanceStakingEthereum: null,
      tokenBalances: {
        JNTR: 0,
        'JNTR/b': 0,
        'JNTR/e': 0,
        JNTR_APPROVED: 0,
        'JNTR/b_APPROVED': 0,
        'JNTR/e_APPROVED': 0,
      },
      jntrbStakingList: [],
      jntreStakingList: [],
      jntrStakingList: [],
      popupData: {
        token: 'JNTR/b',
        stakingAmount: 0.0,
        id: 0,
        rewardAPY: 0.0,
        rewardDays: 1,
      },
      termStakingList: [],
      stakingOptionsList: [],
      stakingOptionsUI: [],
      stakingInstance: null,
    };
  }

  componentWillMount() {
    HodlStakingActions.fetchStakingOptions();
    HodlStakingStores.on(
      'FETCH_STAKING_OPTIONS',
      this.fetchedStakingOptions.bind(this)
    );
    HodlStakingStores.on(
      'CREATE_STAKING_OPTION',
      this.createStakingOptionsResponse.bind(this)
    );
  }

  componentWillUnmount() {
    HodlStakingStores.removeListener(
      'FETCH_STAKING_OPTIONS',
      this.fetchedStakingOptions.bind(this)
    );
    HodlStakingStores.removeListener(
      'CREATE_STAKING_OPTION',
      this.createStakingOptionsResponse.bind(this)
    );
  }

  async fetchedStakingOptions() {
    this.setState(
      {
        stakingOptionsList: HodlStakingStores.getStakingOptions(),
      },
      () => {
        this.updateStakingList();
      }
    );
  }

  async createStakingOptionsResponse() {
    let resp = HodlStakingStores.getCreateStakingOptionsResponse();
    console.log(resp);
  }

  async connectWallet() {
    this.setState({ btnClick: true });
    await web3Config.connectWallet(0);
    let networkId = web3Config.getNetworkId();
    if (!constantConfig.allowedNetwork.includes(networkId)) {
      notificationConfig.error('Please Select Ether or Bsc Test Network');
      this.setState({ btnClick: false });
      return;
    }
    this.setState(
      {
        web3: web3Config.getWeb3(),
        btnClick: false,
      },
      async () => {
        // await this.updateStakingList();
        setInterval(() => {
          this.updateTokenBalance();
        }, 3000);
      }
    );
  }
  componentDidMount = async () => {
    this.setState({
      web3Ethereum: new Web3(
        new Web3.providers.WebsocketProvider(CONSTANT.RPC_PROVIDER_ETHEREUM)
      ),
      web3Binance: new Web3(
        new Web3.providers.HttpProvider(CONSTANT.RPC_PROVIDER_BINANCE)
      ),
    });
    this.setState(
      {
        loading: true,
      },
      async () => {
        await this.initInstance();
      }
    );
    $('.popupLink').on('click', function () {
      var dataId = $(this).attr('data-id');
      $(dataId).fadeIn();
    });
  };
  async initInstance() {
    let { web3Binance, web3Ethereum } = this.state;
    let instanceStakingBinance = null;
    let instanceStakingEthereum = null;
    instanceStakingBinance = new web3Binance.eth.Contract(
      stakingAbi,
      constantConfig[CONSTANT.NETWORK_ID.BINANCE].stakingContract
    );
    instanceStakingEthereum = new web3Ethereum.eth.Contract(
      stakingAbi,
      constantConfig[CONSTANT.NETWORK_ID.ETHEREUM].stakingContract
    );
    let tokenInstance = {};
    tokenInstance['JNTR/b'] = new web3Binance.eth.Contract(
      tokenAbi,
      '0x3c037c4c2296f280bb318d725d0b454b76c199b9'
    );
    tokenInstance['JNTR/e'] = new web3Ethereum.eth.Contract(
      tokenAbi,
      '0x1368452Bfb5Cd127971C8DE22C58fBE89D35A6BF'
    );
    this.setState(
      {
        instanceStakingBinance,
        instanceStakingEthereum,
        tokenInstance,
      },
      async () => {
        // await this.updateStakingList()
      }
    );
  }
  updateStakingList = async () => {
    const { stakingOptionsList } = this.state;

    let stakingOptionsSingle = [];
    let stakingOptionsUI = [];

    for (let i = 0; i < stakingOptionsList.length; i++) {
      for (let j = 0; j < stakingOptionsList[i].stakingOptions.length; j++) {
        stakingOptionsSingle.push(
          <div className={'card'}>
            <div className="timeline">
              <p>
                {stakingOptionsList[i].stakingOptions[j].period / 86400}-days
              </p>
            </div>
            <div className="npTwoIcoMbx">
              <div className="npTISbx01">
                <img src="imgs/need-jntr-b.png" alt="" />
              </div>
              <div className="npTISplusIco">
                <i className="fas fa-plus"></i>
              </div>
              <div className="npTISbx01">
                <img src="imgs/need-jntr-b.png" alt="" />
              </div>
            </div>
            <div className="npTITitle01">
              {
                constantConfig.tokenByAddress[
                  stakingOptionsList[i].stakingOptions[j].stackTokens
                ].symbol
              }
            </div>
            <div className="percentage">
              <p className="twonum">
                {stakingOptionsList[i].stakingOptions[j].rate / 100}{' '}
                <span className="modifyfont">%</span>
                <span className="icon-question"></span>
                <span className="popup">Reward in JNTR/b</span>
              </p>
              <span>Est APY</span>
            </div>
            <div className="comingsoon">
              <p>comingsoon</p>
            </div>
            <div className="stakenow buyJNTRBe hodlnow">
              <a
                href="#"
                onClick={() => {
                  this.stake(i);
                }}
              >
                HODL now
              </a>
            </div>
            <div className="details">
              <a href="#" className="detailsLink">
                <span>details</span>{' '}
                <img
                  className="dropdetailschevron"
                  src="imgs/down.png"
                  alt=""
                />
              </a>
            </div>
            <div className="dropdownlist">
              <div className="dropdowntwolist">
                <ul>
                  <li>
                    your principe LP
                    <p>
                      {
                        constantConfig.tokenByAddress[
                          stakingOptionsList[i].stakingOptions[j].stackTokens
                        ].symbol
                      }
                      :
                    </p>
                  </li>
                  <li className="bSWAPreward">
                    Your cumulative
                    <span>bSWAP reward</span>
                  </li>
                  <li className="">Period left</li>
                </ul>
                <ul>
                  <li>
                    <img src="imgs/jntr-list-card2.png" alt="" />
                    73.25
                  </li>
                  <li>
                    <img src="imgs/brackets.png" alt="" />
                    143.625
                  </li>
                  <li>0 days</li>
                  <li className="withdraw">
                    Widthdraw<span className="icon-question"></span>
                  </li>
                </ul>
                <a href="#" className="viewprojects">
                  View Projects Info <img src="imgs/view.png" alt="" />
                </a>
                <a href="#" className="viewprojects">
                  View Projects Liquidity <img src="imgs/view.png" alt="" />
                </a>
              </div>
            </div>
          </div>
        );
        if (
          stakingOptionsSingle.length % 5 === 0 ||
          (i === stakingOptionsList.length - 1 &&
            j === stakingOptionsList[i].stakingOptions.length - 1)
        ) {
          stakingOptionsUI.push(
            <div className="item">{this.shuffle(stakingOptionsSingle)}</div>
          );
          stakingOptionsSingle = [];
        }
      }
    }
    this.setState(
      {
        stakingOptionsUI: stakingOptionsUI,
      },
      () => {
        setTimeout(() => {
          $('.Flexible-2 .owl-carousel').owlCarousel({
            loop: false,
            margin: 10,
            nav: true,
            dots: false,
            responsive: {
              0: {
                items: 1,
              },
              600: {
                items: 1,
              },
              1000: {
                items: 1,
              },
            },
          });
        }, 1000);
        this.forceUpdate();
      }
    );
  };

  shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  stake = async (id) => {
    if (this.state.web3 !== null) {
      console.log(id);
      if (web3Config.getNetworkId() === 1) {
        id = id - 8;
      }
      console.log(id);
      let { termStakingList, popupData } = this.state;
      console.log('termStakingList', termStakingList);
      popupData['token'] =
        (await web3Config.getNetworkId()) === 1 ? 'JNTR/e' : 'JNTR/b';
      popupData['id'] = id;
      popupData['rewardAPY'] = Web3.utils.fromWei(
        termStakingList.length > 0 ? termStakingList[id][1].toString() : '0'
      );
      popupData['rewardDays'] =
        termStakingList.length > 0
          ? termStakingList[id][0].toString()
          : '0' / 86400;
      this.setState(
        {
          popupData: popupData,
        },
        () => {
          this.forceUpdate();
          $('.mainpopup').addClass('show');
        }
      );
    } else {
      notificationConfig.error('Connect wallet first!');
    }
  };
  updateTokenBalance = async () => {
    if (this.state.web3 !== null) {
      const { tokenInstance, tokenBalances, web3 } = this.state;
      // Balances
      tokenBalances['JNTR/b'] = Web3.utils.fromWei(
        await tokenInstance['JNTR/b'].methods
          .balanceOf(web3Config.getAddress())
          .call(),
        'ether'
      );
      tokenBalances['JNTR/e'] = Web3.utils.fromWei(
        await tokenInstance['JNTR/e'].methods
          .balanceOf(web3Config.getAddress())
          .call(),
        'ether'
      );
      // Approve Balances
      tokenBalances['JNTR/b_APPROVED'] = Web3.utils.fromWei(
        await tokenInstance['JNTR/b'].methods
          .allowance(
            web3Config.getAddress(),
            '0x59188D84dDdfAB858315a4e99Bc5a3aaaF6E768B'
          )
          .call(),
        'ether'
      );
      tokenBalances['JNTR/e_APPROVED'] = Web3.utils.fromWei(
        await tokenInstance['JNTR/e'].methods
          .allowance(
            web3Config.getAddress(),
            '0xf421c80b08891015f73cb8d19aa5dfa01228e39f'
          )
          .call(),
        'ether'
      );
      this.setState(
        {
          tokenBalances: tokenBalances,
        },
        () => {
          this.forceUpdate();
          // this.updateButton()
        }
      );
    }
  };
  async stakeToken(id, amountSend) {
    // alert("here now")
    console.log(id, amountSend);
    let amount = Web3.utils.toWei(amountSend);
    let web3 = web3Config.getWeb3();
    let networkId = web3Config.getNetworkId();
    let address = web3Config.getAddress();
    if (web3 === null) return 0;
    let stakingInstance = new StakingContract(web3Config.getWeb3(), networkId);
    var allow = Web3.utils.toWei(
      await stakingInstance.getApprovedTokenForStaking(
        address,
        '0xD5F2b2f9ADF1237ffBfdd48e51Ed873C9e4bE520',
        stakingInstance.stakingAddress
      )
    );
    if (amount * 1 > allow * 1) {
      stakingInstance.approveJNTRTokenForSwapFactory(
        '0xD5F2b2f9ADF1237ffBfdd48e51Ed873C9e4bE520',
        '0x59188D84dDdfAB858315a4e99Bc5a3aaaF6E768B',
        (hash) => {},
        () => {
          notificationConfig.success('Approve Success');
          stakingInstance.stakeToken(
            id,
            amount,
            (hash) => {},
            () => {
              notificationConfig.success('Staking Success');
            }
          );
        }
      );
    } else {
      stakingInstance.stakeToken(
        id,
        amount,
        (hash) => {},
        () => {
          notificationConfig.success('Staking Success');
        }
      );
    }
  }
  async createPool(token, amount, stackTokens, period, rate, stakingOptions) {
    let web3 = web3Config.getWeb3();
    let networkId = web3Config.getNetworkId();
    let address = web3Config.getAddress();
    if (web3 === null) return 0;
    let stakingInstance = new StakingContract(web3Config.getWeb3(), networkId);
    let tokenInstance = new TokenContract(web3Config.getWeb3(), networkId);
    let iface = new ethers.utils.Interface(stakingAbi);
    await stakingInstance.launchPool(
      token,
      Web3.utils.toWei(amount),
      stackTokens,
      period,
      rate,
      (hash) => {
        console.log(hash);
        notificationConfig.success('Transaction submitted!');
      },
      async (receipt) => {
        console.log(
          '----------------------launchPool-receipt-start--------------------------------'
        );
        console.log(receipt);
        console.log(
          '----------------------launchPool-receipt-end--------------------------------'
        );
        for (let x = 0; x < receipt.logs.length; x++) {
          if (
            receipt.logs[x].topics[0].toLowerCase() ===
            '0xd3802bf49ce4baae3b9d33bcbf4b835b37aa41329b6ff3320c06a172efb0460a'
          ) {
            console.log(iface.parseLog(receipt.logs[x]).args.OptionId);
            for (
              let y = 0;
              y < iface.parseLog(receipt.logs[x]).args.OptionId.length;
              y++
            ) {
              console.log(
                Web3.utils.hexToNumber(
                  iface.parseLog(receipt.logs[x]).args.OptionId[0]._hex
                )
              );
              stakingOptions[y].optionId = Web3.utils.hexToNumber(
                iface.parseLog(receipt.logs[x]).args.OptionId[y]._hex
              );
            }
          }
        }
        let txData = {
          type: 'hodlSingleTokens',
          vaultAddress: token,
          token: token,
          amount: Web3.utils.toWei(amount),
          stakingOptions: stakingOptions,
        };
        console.log(
          '---------------------------------txData-start----------------------------------'
        );
        console.log(txData);
        console.log(
          '---------------------------------txData-end----------------------------------'
        );
        HodlStakingActions.createOption(txData);
        notificationConfig.success('Pool launch Success');
      }
    );
    // let amount = Web3.utils.toWei(amountSend);
    // var allow = Web3.utils.toWei(await stakingInstance.getApprovedTokenForStaking(address, "0x3c037c4c2296f280bb318d725d0b454b76c199b9", stakingInstance.stakingAddress));
    // if (amount * 1 > allow * 1) {
    //     stakingInstance.approveJNTRTokenForSwapFactory("0x3c037c4c2296f280bb318d725d0b454b76c199b9", "0x59188D84dDdfAB858315a4e99Bc5a3aaaF6E768B", (hash) => { }, () => {
    //         notificationConfig.success("Approve Success");
    //         stakingInstance.stakeToken(id, amount, (hash) => { }, () => {
    //             notificationConfig.success("Staking Success");
    //         })
    //     })
    // } else {
    //     stakingInstance.stakeToken(id, amount, (hash) => { }, () => {
    //         notificationConfig.success("Staking Success");
    //     })
    // }
  }
  async showLaunchContractPopup() {
    document.querySelector('.mypopup').classList.add('show');
  }
  render() {
    return (
      <div>
        <nav className="mainnav">
          <div className="navbar">
            <div className="logo">
              <a href="#">
                {' '}
                <img src="imgs/logo.png" alt="" />
              </a>
            </div>
            <div className="listlinks">
              <p className="supporting-dex">
                Supporting <br />
                78 DEXs:
              </p>
              <ul>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon1.png" alt="" />
                  </a>{' '}
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon2.png" alt="" />
                  </a>{' '}
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon3.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon4.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon5.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon6.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon7.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon8.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon9.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon10.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon11.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon12.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon13.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon14.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon15.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon16.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon17.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon18.png" alt="" />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <img src="imgs/nav-icon19.png" alt="" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="control-wallet">
              <a href="#">
                <img src="imgs/bnb.png" alt="" />
              </a>
              {this.state.web3 === null ? (
                <a
                  href="#"
                  onClick={() => {
                    this.connectWallet();
                  }}
                >
                  connect wallet
                </a>
              ) : (
                <a href="#" style={{ color: 'white' }}>
                  {web3Config.getAddress().slice(0, 6) +
                    '...' +
                    web3Config.getAddress().slice(38, 42)}{' '}
                  &nbsp;
                  <i
                    className="fas fa-sync-alt"
                    style={{ fontSize: '13px' }}
                    aria-hidden="true"
                    onClick={() => {
                      this.connectWallet();
                    }}
                  ></i>
                </a>
              )}
              {/* <a href="#"><span className="icon-cog"></span></a>
                            <a href="#"><span></span><span></span><span></span></a> */}
              <a href="#">
                <span className="dotmenu"></span>
              </a>
            </div>
            <div className="hamburgmenu">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="right-section-arrow">
              <i class="fas fa-angle-left"></i>
            </div>
          </div>
        </nav>
        <div className="herosquarebanner">
          <div className="container">
            <div className="main-hero">
              <div className="bswap-logo">
                <img src="imgs/main-logo.png" alt="" />
              </div>
              <h1> SAVE AND INVEST </h1>
              <div className="cta">
                <a href="#">THE HOME FOR DeFi</a>
              </div>
            </div>
          </div>
        </div>

        <div className="Hodl-five-columns">
          <div className="container">
            <div className="uppanel" id="myUppanel">
              <div className="Hodl-inner">
                <div className="side">
                  <div className="feature">
                    <h5>HODL Single Token</h5>
                    <p>
                      Stake your tokens for fixed periods to earn APY rewards
                    </p>
                  </div>
                  <div className="feature">
                    <h5>Farming Pools</h5>
                    <p>
                      You can farm your LP at any time. APY rewards are
                      distributed pro-rata based on the actual period the LP is
                      farmed.
                    </p>
                  </div>
                  <div className="feature">
                    <h5>Burning Pools</h5>
                    <p>Burn select tokens to earn tokens or LP tokens</p>
                  </div>
                  <div className="feature">
                    <h5>Forging Pools</h5>
                    <p>
                      Forg allows users to stake bSWAP and earn other tokens.
                      Users can withdraw token(s) at any time. If the tokens are
                      withdrawn before the forging period ends, you will NOT
                      receive the APY reward but do not earn a penalty.
                    </p>
                  </div>
                </div>
                <div className="side">
                  <div className="feature">
                    <h5>Flexible Tokens</h5>
                    <p>
                      Halving every 1 year, 5% fee on staked tokens for every
                      harvest & unstake
                    </p>
                  </div>
                  <div className="feature">
                    <h5>HODL LP Token</h5>
                    <p>Lock your LP for long-term period to gain higher APY</p>
                  </div>
                </div>
                <div className="side">
                  <div className="feature">
                    <h5>MULTI SWAP</h5>
                    <p>One-click to open or add liquidity to all DEXs</p>
                  </div>
                  <div className="feature">
                    <h5>SMART SWAP</h5>
                    <p>One-click slippage-free cross-chain swap</p>
                  </div>
                  <div className="feature">
                    <h5>AGGREGATOR SWAP</h5>
                    <p>One-click cross-chain liquidity aggregator</p>
                  </div>
                </div>
                <div className="side">
                  <div className="feature">
                    <h5>Launchpool</h5>
                    <p>
                      No hiding discounts, everyone equal, APY staking reward
                      with a way out at any time, team and founders has 0%
                      allocation, 100% of supply for sale, leftover burn, 100%
                      of proceed goes to the liquidity pool and LP burn
                    </p>
                  </div>
                  <div className="feature">
                    <h5>Fair Launch</h5>
                    <p>
                      Investors, buy tokens directly from projects without
                      slippage, 100% of the fund goes to create a liquidity
                      pool. Projects, raise fund to open liquidity pool on
                      uniswap, pancake swap, bSWAP or anywhere else
                    </p>
                  </div>
                  <div className="feature">
                    <h5>Presale</h5>
                    <p>
                      Send your ETH or BNB for ground floor access to new tokens
                      with APY rewards{' '}
                    </p>
                  </div>
                </div>
                <div className="side">
                  <div className="feature">
                    <h5>IDO</h5>
                    <p>Initial DEX offerings for tokens launching on bSWAP</p>
                  </div>
                  <div className="feature">
                    <h5>PDO</h5>
                    <p>
                      nvestors, buy tokens directly from existing projects
                      without slippage and with available liquidity pools.
                      Existing projects, raise funds for operational and to
                      buyout and burn token supply
                    </p>
                  </div>
                  <div className="feature">
                    <h5>Welcome Bonus</h5>
                    <p>Airdrop alternative from Ethereum to BEP20 tokens</p>
                  </div>
                  <div className="feature">
                    <h5>DeFi Auctions</h5>
                    <p>Increase your assets through daily incentives</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="arrow-up-outer">
              <div className="arrow-up-section openbtn">
                <i class="fas fa-angle-up"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="total-locked-value">
          <div className="container">
            <h3 className="pressfont fsize-16 text-left uppercase">
              Total Locked Value Over 78 DEXs
            </h3>
            <div className="total-locked-value-numbers">
              <div className="mainnumber">
                <span>
                  {' '}
                  <b>$</b>
                </span>
                <span>
                  {' '}
                  <b className="number">1</b>
                </span>
                <span>
                  {' '}
                  <b className="number">2</b>
                </span>
              </div>
              <p className="apostrof">
                <img src="imgs/,-copy.png" alt="" />
              </p>
              <div className="mainnumber">
                <span>
                  <b className="number">4</b>
                </span>
                <span>
                  <b className="number">8</b>
                </span>
                <span>
                  <b className="number">1</b>
                </span>
              </div>
              <p className="apostrof">
                <img src="imgs/,-copy.png" alt="" />
              </p>
              <div className="mainnumber">
                <span>
                  <b className="number">9</b>
                </span>
                <span>
                  <b className="number">2</b>
                </span>
                <span>
                  <b className="number">5</b>
                </span>
              </div>
              <p className="apostrof">
                <img src="imgs/,-copy.png" alt="" />
              </p>
              <div className="mainnumber">
                <span>
                  <b className="number">6</b>
                </span>
                <span>
                  <b className="number">5</b>
                </span>
                <span>
                  <b className="number">1</b>
                </span>
              </div>
              <p className="dotnumber"></p>
              <div className="mainnumber">
                <span>
                  <b className="number">5</b>
                </span>
                <span>
                  <b className="number">6</b>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="top-products">
          <div className="container">
            <h2>Top Products</h2>
            <div className="owl-carousel owl-theme">
              <div className="item">
                <div className="content-products">
                  <div className="card">
                    <h3 className="flxstaking">Flexible staking</h3>
                    <div className="percentage">
                      <p>
                        10 <span className="modifyfont">%</span>
                      </p>
                      <span>Est APY</span>
                    </div>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className="newRatebx">
                      <img src="imgs/jntr.png" />
                      <span>JNTR/b</span>
                    </div>
                    <div className="stakenow btnstake">
                      <a href="#">stake now</a>
                    </div>
                  </div>
                  <div className="card comingsooncard">
                    <h3 className="flxstaking">HODL Tokens</h3>
                    <div className="percentage">
                      <p>
                        100 <span className="modifyfont">%</span>
                      </p>
                      <span>Est APY</span>
                    </div>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className="newRatebx">
                      <img src="imgs/jntr.png" />
                      <span>JNTR/e</span>
                    </div>
                    <div className="stakenow">
                      <a href="#">stake now</a>
                    </div>
                  </div>
                  <div className="card comingsooncard">
                    <h3 className="flxstaking">HODL LP</h3>
                    <div className="percentage">
                      <p>
                        176.45 <span className="modifyfont">%</span>
                      </p>
                      <span>Est APY</span>
                    </div>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className="newRatebx">
                      <img src="imgs/jntr.png" alt="" />
                      <img src="imgs/bnb.png" alt="" />
                      <span>JNTR/b - BNB lP</span>
                    </div>
                    <div className="stakenow">
                      <a href="#">stake now</a>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="flxstaking">DeFi Auction</h3>
                    <div className="percentage">
                      <img
                        className="img-center"
                        src="imgs/jointer-logo.png"
                        alt=""
                      />
                    </div>
                    <p className="jntrtitle">
                      JNTR ROI SINCE Launch :{' '}
                      <span>
                        5,330.53%<b>(53.31x)</b>
                      </span>
                    </p>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className=" nexauctioncomp">
                      <span className="nextauction">
                        Next Auction Start in{' '}
                      </span>
                      <div className="countspan">
                        <div className="1">
                          <span>0</span>
                          <span>4</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="2">
                          <span>2</span>
                          <span>5</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="3">
                          <span>5</span>
                          <span>3</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="4">
                          <span>0</span>
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                    <div className="stakenow greencolor">
                      <a href="#">go to live auction</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div className="content-products">
                  <div className="card">
                    <h3 className="flxstaking">Farming</h3>
                    <div className="nPrTextbox01 OrngC">
                      <span>
                        {' '}
                        Deposit <span>DOT-BNB LP</span>{' '}
                      </span>
                      <span>
                        {' '}
                        Earn <span>bSWAP</span>{' '}
                      </span>
                      <span>
                        {' '}
                        APY <i class="fas fa-question-circle"></i>{' '}
                        <span>352.45%</span>{' '}
                      </span>
                      <span>
                        {' '}
                        Total Liquidity <span>$6,970,088</span>{' '}
                      </span>
                    </div>
                    <div className="newRatebx">
                      <img src="imgs/dot-Logo.png" />
                      <img src="imgs/bnb.png" />
                      <span>DOT - BNB LP</span>
                    </div>
                    <div className="stakenow btnstake">
                      <a href="#">stake now</a>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="flxstaking">Burn</h3>
                    <div className="nPrTextbox01">
                      <span>
                        {' '}
                        Deposit{' '}
                        <span>
                          <div className="smlDDmenu">
                            <a
                              href="javascript:void(0)"
                              className="popupLink"
                              data-id="#smlDDC-01"
                            >
                              365 days <i className="fas fa-caret-down"></i>
                            </a>
                            <div className="smlDDContainer" id="smlDDC-01">
                              <a href="#">50 days</a>
                              <a href="#">100 days</a>
                              <a href="#">200 days</a>
                              <a href="#">365 days</a>
                            </div>
                          </div>
                        </span>{' '}
                      </span>
                      <span>
                        {' '}
                        Earn <span>bSWAP</span>{' '}
                      </span>
                      <span>
                        {' '}
                        APY <span>352.45%</span>{' '}
                      </span>
                    </div>
                    <div className="newRatebx">
                      <img src="imgs/dot-Logo.png" />
                      <span>DOT</span>
                      {/* <img src="imgs/jntr.png" />
                                            <span>JNTR/b</span> */}
                    </div>
                    <div className="stakenow">
                      <a href="#">Receive bSWAP</a>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="flxstaking">Parking</h3>
                    <div className="nPrTextbox01">
                      <span>
                        {' '}
                        Deposit{' '}
                        <span>
                          <div className="smlDDmenu">
                            <a
                              href="javascript:void(0)"
                              className="popupLink"
                              data-id="#smlDDC-01"
                            >
                              365 days <i className="fas fa-caret-down"></i>
                            </a>
                            <div className="smlDDContainer" id="smlDDC-01">
                              <a href="#">50 days</a>
                              <a href="#">100 days</a>
                              <a href="#">200 days</a>
                              <a href="#">365 days</a>
                            </div>
                          </div>
                        </span>{' '}
                      </span>
                      <span>
                        {' '}
                        Earn <span>bSWAP</span>{' '}
                      </span>
                      <span>
                        {' '}
                        APY <span>352.45%</span>{' '}
                      </span>
                    </div>
                    <div className="newRatebx">
                      <img src="imgs/dot-Logo.png" />
                      <span>DOT</span>
                      {/* <img src="imgs/jntr.png" />
                                            <span>JNTR/b</span> */}
                    </div>
                    <div className="stakenow btnstake">
                      <a href="#">Receive bSWAP</a>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="flxstaking">Welcome Bonus</h3>
                    <div className="nPrTextbox01 nPrTextbox-welcome">
                      <span>
                        {' '}
                        Send{' '}
                        <span>
                          0.01 ETH <br />
                          (~$1)
                        </span>{' '}
                      </span>
                      <span>
                        {' '}
                        Receive ERC20{' '}
                        <span>
                          1,000 JNTR <br />
                          (~$100)
                        </span>{' '}
                      </span>
                      <span>
                        {' '}
                        Staking included <span>Yes</span>{' '}
                      </span>
                      <span>
                        {' '}
                        Staking period <i class="fas fa-question-circle"></i>
                        <span>90 days</span>{' '}
                      </span>
                      <span>
                        {' '}
                        APY <i class="fas fa-question-circle"></i>
                        <span>50%</span>{' '}
                      </span>
                    </div>
                    <div className="newRatebx">
                      <img src="imgs/dot-Logo.png" />
                      <span>DOT</span>
                      {/* <img src="imgs/jntr.png" />
                                            <span>JNTR/b</span> */}
                    </div>
                    <div className="stakenow btnstake">
                      <a href="#">Claim Your Bonus</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div className="content-products">
                  <div className="card">
                    <h3 className="flxstaking">IDO</h3>
                    <div className="newPrDetailMbx">
                      <div className="newPrDSbx">
                        <div className="newPrDImgbx">
                          {' '}
                          <img src="imgs/forgIcon-03.png" />{' '}
                        </div>
                        DOT <span>Polkadot</span>
                      </div>
                      <div className="newPrDSbx02">
                        Dutch Auction <i className="fas fa-question-circle"></i>
                        <span>484.13% APY </span>
                      </div>
                    </div>
                    <div className="newPrOrngBar">
                      <span style={{ width: '20%' }}></span>
                    </div>
                    <div className=" nexauctioncomp">
                      <span className="nextauction">Current IDO ends in </span>
                      <div className="countspan">
                        <div className="1">
                          <span>0</span>
                          <span>4</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="2">
                          <span>2</span>
                          <span>5</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="3">
                          <span>5</span>
                          <span>3</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="4">
                          <span>0</span>
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                    <div className="newInvstBox">
                      <div className="newIimgBx">
                        <img src="imgs/bnb.png" alt="" />
                        <a
                          href="javascript:void(0);"
                          className="ddBTN popupLink"
                          data-id="#ddM02"
                        ></a>
                      </div>
                      <input type="text" defaultValue="1.2535" />
                      <button>Invest</button>
                    </div>
                  </div>
                  <div className="card comingsooncard">
                    <h3 className="flxstaking">term staking</h3>
                    <div className="percentage">
                      <p>
                        100 <span className="modifyfont">%</span>
                      </p>
                      <span>Est APY</span>
                    </div>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className="rate">
                      <img src="imgs/jntr.png" alt="" />
                      <p className="bottomtitle">JNTR/e</p>
                    </div>
                    <div className="stakenow">
                      <a href="#">stake now</a>
                    </div>
                  </div>
                  <div className="card comingsooncard">
                    <h3 className="flxstaking">locked lp staking</h3>
                    <div className="percentage">
                      <p>
                        176.45 <span className="modifyfont">%</span>
                      </p>
                      <span>Est APY</span>
                    </div>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className="rate">
                      <img src="imgs/jntr.png" alt="" />
                      <img src="imgs/bnb.png" alt="" />
                      <p className="bottomtitle">JNTR/b - BNB lP</p>
                    </div>
                    <div className="stakenow">
                      <a href="#">stake now</a>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="flxstaking">deFi auction </h3>
                    <div className="percentage">
                      <img
                        className="img-center"
                        src="imgs/jointer-logo.png"
                        alt=""
                      />
                    </div>
                    <p className="jntrtitle">
                      JNTR ROI SINCE Launch :{' '}
                      <span>
                        5,330.53%<b>(53.31x)</b>
                      </span>
                    </p>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className=" nexauctioncomp">
                      <span className="nextauction">
                        Next Auction Start in{' '}
                      </span>
                      <div className="countspan">
                        <div className="1">
                          <span>0</span>
                          <span>4</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="2">
                          <span>2</span>
                          <span>5</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="3">
                          <span>5</span>
                          <span>3</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="4">
                          <span>0</span>
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                    <div className="stakenow greencolor">
                      <a href="#">go to live auction</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div className="content-products">
                  <div className="card">
                    <h3 className="flxstaking">Flexible staking</h3>
                    <div className="percentage">
                      <p>
                        10 <span className="modifyfont">%</span>
                      </p>
                      <span>Est APY</span>
                    </div>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className="rate">
                      <img src="imgs/jntr.png" alt="" />
                      <p className="bottomtitle">JNTR/b</p>
                    </div>
                    <div className="stakenow btnstake">
                      <a href="#">stake now</a>
                    </div>
                  </div>
                  <div className="card comingsooncard">
                    <h3 className="flxstaking">term staking</h3>
                    <div className="percentage">
                      <p>
                        100 <span className="modifyfont">%</span>
                      </p>
                      <span>Est APY</span>
                    </div>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className="rate">
                      <img src="imgs/jntr.png" alt="" />
                      <p className="bottomtitle">JNTR/e</p>
                    </div>
                    <div className="stakenow">
                      <a href="#">stake now</a>
                    </div>
                  </div>
                  <div className="card comingsooncard">
                    <h3 className="flxstaking">locked lp staking</h3>
                    <div className="percentage">
                      <p>
                        176.45 <span className="modifyfont">%</span>
                      </p>
                      <span>Est APY</span>
                    </div>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className="rate">
                      <img src="imgs/jntr.png" alt="" />
                      <img src="imgs/bnb.png" alt="" />
                      <p className="bottomtitle">JNTR/b - BNB lP</p>
                    </div>
                    <div className="stakenow">
                      <a href="#">stake now</a>
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="flxstaking">deFi auction </h3>
                    <div className="percentage">
                      <img
                        className="img-center"
                        src="imgs/jointer-logo.png"
                        alt=""
                      />
                    </div>
                    <p className="jntrtitle">
                      JNTR ROI SINCE Launch :{' '}
                      <span>
                        5,330.53%<b>(53.31x)</b>
                      </span>
                    </p>
                    <div className="comingsoon">
                      <p>comingsoon</p>
                    </div>
                    <div className=" nexauctioncomp">
                      <span className="nextauction">
                        Next Auction Start in{' '}
                      </span>
                      <div className="countspan">
                        <div className="1">
                          <span>0</span>
                          <span>4</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="2">
                          <span>2</span>
                          <span>5</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="3">
                          <span>5</span>
                          <span>3</span>
                        </div>
                        <span className="colon">:</span>
                        <div className="4">
                          <span>0</span>
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                    <div className="stakenow greencolor">
                      <a href="#">go to live auction</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="swap-with">
          <div className="container">
            <div className="swap-with-inner">
              <div className="w33">
                <div className="swap-with-box">
                  <div className="swap-with-header">
                    <div className="swap-with-left">
                      <img src="imgs/swap-with-icon1.png" alt="" />
                      <p>Add Liquidity</p>
                    </div>
                    <i class="fas fa-question-circle"></i>
                  </div>
                  <div className="swap-with-middle">
                    <div className="swap-with-form">
                      <div className="swap-with-form-top">
                        <label>Input</label>
                        <p>Balance: 0.005123 </p>
                      </div>
                      <div className="swap-with-form-bottom">
                        <input type="text" placeholder="0 . 0" />
                        <div className="swap-with-form-bottom-right">
                          <badge>MAX</badge>
                          <img src="" alt="" />
                          <div className="smlDDmenu">
                            <a
                              href="javascript:void(0)"
                              className="popupLink"
                              data-id="#smlDDC-01"
                            >
                              365 days <i className="fas fa-caret-down"></i>
                            </a>
                            <div className="smlDDContainer" id="smlDDC-01">
                              <a href="#">50 days</a>
                              <a href="#">100 days</a>
                              <a href="#">200 days</a>
                              <a href="#">365 days</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w33"></div>
              <div className="w33"></div>
            </div>
          </div>
        </div>

        <div className="Flexible-1">
          <div className="container">
            <div className="content">
              <div className="leftside">
                <p className="flex-p">Flexible</p>
                <p className="text">
                  No deposits needed, <br /> just hold in your own wallet and
                  more tokens will come to you{' '}
                </p>
                <img className="number" src="imgs/no1.png" alt="" />
                <img className="flexiblecoins" src="imgs/coins.png" alt="" />
              </div>
              <div className="right-side">
                <div className="headings">
                  <div className="left">
                    <h2>Flexible Staking</h2>
                    <p>Rewards distributed every block!</p>
                  </div>
                  <div className="right">
                    <img
                      style={{ opacity: '0' }}
                      className="cupstake"
                      src="imgs/cupstaking.png"
                      alt=""
                    />
                    <p>
                      Your Current earnings to date <span>$2,504.13</span>{' '}
                    </p>
                  </div>
                </div>

                <div className="cmngSoonTitle01">COMING SOON</div>

                {/* <div className="twocards">
                                    <div className="card">
                                        <div className="jntr-bswap">
                                            <img src="imgs/big0jnrt.png" alt="" />
                                            <p>JNTR/b</p>
                                        </div>
                                        <div className="percentage">
                                            <p>10 <span className="modifyfont">%</span></p>
                                            <span>Est APY</span>
                                        </div>
                                        <div className="comingsoon">
                                            <p>comingsoon</p>
                                        </div>
                                        <div className="stakenow ">
                                            <a href="#">buy more</a>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div className="jntr-bswap">
                                            <img src="imgs/b-swapcard.png" alt="" />
                                            <p>bSWAP</p>
                                        </div>
                                        <div className="percentage">
                                            <p>10 <span className="modifyfont">%</span></p>
                                            <span>Est APY</span>
                                        </div>
                                        <div className="comingsoon">
                                            <p>comingsoon</p>
                                        </div>
                                        <div className="stakenow">
                                            <a href="#">buy more</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="seemorecards">
                                    <a href="#"> more flexible staking options</a>
                                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="Flexible-2">
          <div className="container">
            <div className="content">
              <div className="leftside">
                <p className="flex-p">token staking</p>
                <p className="text">
                  stake your tokens for fixed periods to earn APY rewards
                </p>
                <img className="number" src="imgs/no2.png" alt="" />
                <img className="prize" src="imgs/prize.png" alt="" />
              </div>
              <div className="right-side">
                <div className="headings">
                  <div className="left">
                    <h2>HODL single tokens</h2>
                    <p>single token fixed-period staking</p>
                  </div>
                </div>
                <div className="twocards">
                  <div className="owl-carousel owl-theme">
                    {this.state.stakingOptionsUI}
                  </div>
                </div>
                <div className="seemorecards">
                  <a href="#">More HODL staking options</a>{' '}
                  <span className="columnspan">|</span>{' '}
                  <a
                    href="#"
                    onClick={() => {
                      this.showLaunchContractPopup();
                    }}
                  >
                    Launch your HODL staking pool
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="Flexible-3">
          <div className="container">
            <div className="content">
              <div className="leftside">
                <p className="flex-p">
                  LP <br /> Staking
                </p>
                <p className="text">
                  lock your LP for long-term period to gain higher APY
                </p>
                <img className="number" src="imgs/3.png" alt="" />
                <img className="prize" src="imgs/prize-3.png" alt="" />
              </div>
              <div className="right-side">
                <div className="headings">
                  <div className="left">
                    <h2>LP token staking</h2>
                    <p>time locking for select LP pairs</p>
                  </div>
                </div>
                <div className="cmngSoonTitle01">COMING SOON</div>
                {/* <div className="twocards">
                                    <div className="owl-carousel owl-theme">
                                        <div className="item">
                                            <div className="card">
                                                <div className="timeline">
                                                    <p>180-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum">57 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/b</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow approve">
                                                    <a href="#">approve</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>hide</span> <img className="dropdetailschevron " src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist ">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card ">
                                                <div className="timeline">
                                                    <p>365-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/eth-icon02.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-ETH LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum">62 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/b</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">stake now</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>hide</span> <img className="dropdetailschevron " src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist ">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card  ">
                                                <div className="timeline">
                                                    <p>180-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum last2num">67 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/b</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">stake now</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>hide</span> <img className="dropdetailschevron " src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="timeline">
                                                    <p>30-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum">57 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/e</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow  greencolor">
                                                    <a href="#">Claim Your Tokens</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card ">
                                                <div className="timeline">
                                                    <p>60-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum">62 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/e</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow">
                                                    <a href="#">HODL Now</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card  ">
                                                <div className="timeline">
                                                    <p>90-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum last2num">67 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/e</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow">
                                                    <a href="#">HODL Now</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="card">
                                                <div className="timeline">
                                                    <p>180-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum">57 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/b</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow approve">
                                                    <a href="#">approve</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>hide</span> <img className="dropdetailschevron " src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist ">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card ">
                                                <div className="timeline">
                                                    <p>365-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum">62 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/b</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">stake now</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>hide</span> <img className="dropdetailschevron " src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist ">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card  ">
                                                <div className="timeline">
                                                    <p>180-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum last2num">67 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/b</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">stake now</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>hide</span> <img className="dropdetailschevron " src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="timeline">
                                                    <p>30-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum">57 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/e</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow  greencolor">
                                                    <a href="#">Claim Your Tokens</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card ">
                                                <div className="timeline">
                                                    <p>60-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum">62 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/e</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow">
                                                    <a href="#">HODL Now</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card  ">
                                                <div className="timeline">
                                                    <p>90-days</p>
                                                </div>
                                                <div className="npTwoIcoMbx">
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                        <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                    </div>
                                                    <div className="npTISplusIco"><i className="fas fa-plus"></i></div>
                                                    <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /></div>
                                                </div>
                                                <div className="npTITitle01">JNTR/b-BNB LP + JNTR/b</div>
                                                <div className="percentage">
                                                    <p className="twonum last2num">67 <span className="modifyfont">%</span>
                                                        <span className="icon-question"></span>
                                                        <span className="popup">Reward in JNTR/e</span>
                                                    </p>
                                                    <span>Est APY</span>
                                                </div>
                                                <div className="comingsoon">
                                                    <p>comingsoon</p>
                                                </div>
                                                <div className="stakenow">
                                                    <a href="#">HODL Now</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP
                         <p>JNTR/b:</p>
                                                            </li>
                                                            <li className="bSWAPreward">Your cumulative
                         <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="">Period left</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/jntr-list-card2.png" alt="" />73.25</li>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>0 days</li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                        <a href="#" className="viewprojects">View Projects Info <img src="imgs/view.png" alt="" /></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <img src="imgs/view.png" alt="" /></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="seemorecards">
                                    <a href="#">More HODL LP staking options</a> <span className="columnspan">|</span> <a href="#">Launch your HODL staking pool</a>
                                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="Flexible-4">
          <div className="container">
            <div className="content">
              <div className="leftside">
                <p className="flex-p">farming</p>
                <p className="text">
                  You can farm your LP at any time.APY rewards are distributed
                  pro-rata based on the actual period the LP is farmed.
                </p>
                <img className="number" src="imgs/no4.png" alt="" />
                <img className="prize" src="imgs/prize4.png" alt="" />
              </div>
              <div className="right-side">
                <div className="headings">
                  <div className="left">
                    <h2>Farm LP with Staking</h2>
                    <p>
                      Farm LPs from token pair and get more tokens rewards every
                      block
                    </p>
                  </div>
                </div>
                <div className="cmngSoonTitle01">COMING SOON</div>
                {/* <div className="twocards">
                                    <div className="owl-carousel owl-theme">
                                        <div className="item">
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-01.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farming-card4">
                                                <div className="top-part">
                                                    <div className="npTwoIcoMbx">
                                                        <div className="npTISbx01"><img src="imgs/farmIcon-02.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/farmIcon-03.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>deposit</li>
                                                        <li>earn</li>
                                                        <li>APY <img src="imgs/farming-ques.png" alt="" /></li>
                                                    </ul>
                                                    <ul>
                                                        <li>BTCB-BNB LP</li>
                                                        <li>bSWAP</li>
                                                        <li>352.4%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakefarm">
                                                    <a href="#">Farm Now</a>
                                                </div>
                                                <div className="onelist">
                                                    <ul>
                                                        <li>total liquidity</li>
                                                        <li>$6,970,088</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>your principe LP:</li>
                                                            <li className="bSWAPreward">your cumulative
                                <span>bSWAP reward</span>
                                                            </li>
                                                            <li className="checkBsc">check BSCscan</li>
                                                            <li className="buymore">Buy more BUSD-BNB LP</li>
                                                        </ul>
                                                        <ul>
                                                            <li>2,538.65</li>
                                                            <li>485,623</li>
                                                            <li></li>
                                                            <li className="withdraw">Widthdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="seemorecards">
                                    <a href="#">More farming options</a> <span className="columnspan">|</span><a href="#"> Launch your farming pool</a>
                                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="Flexible-5">
          <div className="container">
            <div className="content">
              <div className="leftside">
                <p className="flex-p">burn</p>
                <p className="text">
                  burn select tokens to earn bSWAP or LP tokens
                </p>
                <img className="number" src="imgs/5.png" alt="" />
                <img className="prize" src="imgs/prize-5.png" alt="" />
              </div>
              <div className="right-side">
                <div className="headings">
                  <div className="left">
                    <h2>burn token to gain new tokens + rewards</h2>
                    <div className="toggleLptokens">
                      <span className="tokens">Tokens</span>
                      <span className="lptokens active ">LP Tokens</span>
                    </div>
                  </div>
                </div>
                <div className="cmngSoonTitle01">COMING SOON</div>
                {/*                                 
                                <div className="twocards  TokenSection">
                                    <div className="owl-carousel owl-theme">
                                        <div className="item">
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receive">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                </div>
                                                <div className="receivebswap">
                                                    <a href="#">Receive bSWAP</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                            <li>&nbsp;</li>
                                                            <li><a href="#" className="viewprojects">View Projects Info  <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                            <li className="withdraw">Withdrawn<span className="icon-question"></span></li>
                                                            <li> <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receive">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                </div>
                                                <div className="receivebswap">
                                                    <a href="#">Receive JNTR/b</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                            <li>&nbsp;</li>
                                                            <li><a href="#" className="viewprojects">View Projects Info  <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                            <li className="withdraw">Withdrawn<span className="icon-question"></span></li>
                                                            <li> <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receive">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                </div>
                                                <div className="soldout">
                                                    <a href="#">Sold Out</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                            <li>&nbsp;</li>
                                                            <li><a href="#" className="viewprojects">View Projects Info  <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                            <li className="withdraw">Withdrawn<span className="icon-question"></span></li>
                                                            <li> <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receive">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                </div>
                                                <div className="connectwallet">
                                                    <a href="#">Connect Wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                            <li>&nbsp;</li>
                                                            <li><a href="#" className="viewprojects">View Projects Info  <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                            <li className="withdraw">Withdrawn<span className="icon-question"></span></li>
                                                            <li> <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receive">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                </div>
                                                <div className="receivebswap">
                                                    <a href="#">Receive bSWAP</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                            <li>&nbsp;</li>
                                                            <li><a href="#" className="viewprojects">View Projects Info  <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                            <li className="withdraw">Withdrawn<span className="icon-question"></span></li>
                                                            <li> <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receive">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                </div>
                                                <div className="receivebswap">
                                                    <a href="#">Receive JNTR/b</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                            <li>&nbsp;</li>
                                                            <li><a href="#" className="viewprojects">View Projects Info  <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                            <li className="withdraw">Withdrawn<span className="icon-question"></span></li>
                                                            <li> <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receive">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                </div>
                                                <div className="soldout">
                                                    <a href="#">Sold Out</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                            <li>&nbsp;</li>
                                                            <li><a href="#" className="viewprojects">View Projects Info  <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                            <li className="withdraw">Withdrawn<span className="icon-question"></span></li>
                                                            <li> <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receive">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                </div>
                                                <div className="connectwallet">
                                                    <a href="#">Connect Wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                            <li>&nbsp;</li>
                                                            <li><a href="#" className="viewprojects">View Projects Info  <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                            <li className="withdraw">Withdrawn<span className="icon-question"></span></li>
                                                            <li> <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="twocards active lpTokenSection">
                                    <div className="owl-carousel owl-theme">
                                        <div className="item">
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="route-slippage">
                                                    <p className="routetext">Route slippage<i className="fas fa-question-circle"></i></p>
                                                    <div className="route-marks">
                                                        <div>
                                                            <img src="imgs/smallcake.png" alt="" />
                                                            <p>Cake</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/smallbnb.png" alt="" />
                                                            <p>BNB</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/small-bnb-lp.png" alt="" />
                                                            <p>BNB-bSWAP LP</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="invest">
                                                    <div className="input-group">
                                                        <div className="leftimg">
                                                            <img src="imgs/mediumcake.png" alt="" />
                                                        </div>
                                                        <input type="text" placeholder="1.2535" />
                                                        <button type="submit">Burn</button>
                                                        <span className="lastnum receivebnb">Receive ~ 2.2353 BNB-bSWAP LP</span>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="route-slippage">
                                                    <p className="routetext">Route slippage<i className="fas fa-question-circle"></i></p>
                                                    <div className="route-marks">
                                                        <div>
                                                            <img src="imgs/smalldot.png" alt="" />
                                                            <p>DOT</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/smallbnb.png" alt="" />
                                                            <p>BNB</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/small-bnb-lp.png" alt="" />
                                                            <p>BNB-bSWAP LP</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className=" connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="route-slippage">
                                                    <p className="routetext">Route slippage<i className="fas fa-question-circle"></i></p>
                                                    <div className="route-marks">
                                                        <div>
                                                            <img src="imgs/smallada.png" alt="" />
                                                            <p>ADA</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/smallbnb.png" alt="" />
                                                            <p>BNB</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/small-bnb-lp.png" alt="" />
                                                            <p>BNB-bSWAP LP</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className=" connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="route-slippage">
                                                    <p className="routetext">Route slippage<i className="fas fa-question-circle"></i></p>
                                                    <div className="route-marks">
                                                        <div>
                                                            <img src="imgs/small-ankor.png" alt="" />
                                                            <p>ANKR</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/smallbnb.png" alt="" />
                                                            <p>BNB</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/small-bnb-lp.png" alt="" />
                                                            <p>BNB-bSWAP LP</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className=" connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="route-slippage">
                                                    <p className="routetext">Route slippage<i className="fas fa-question-circle"></i></p>
                                                    <div className="route-marks">
                                                        <div>
                                                            <img src="imgs/smallcake.png" alt="" />
                                                            <p>Cake</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/smallbnb.png" alt="" />
                                                            <p>BNB</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/small-bnb-lp.png" alt="" />
                                                            <p>BNB-bSWAP LP</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="invest">
                                                    <div className="input-group">
                                                        <div className="leftimg">
                                                            <img src="imgs/mediumcake.png" alt="" />
                                                        </div>
                                                        <input type="text" placeholder="1.2535" />
                                                        <button type="submit">Burn</button>
                                                        <span className="lastnum receivebnb">Receive ~ 2.2353 BNB-bSWAP LP</span>
                                                    </div>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="route-slippage">
                                                    <p className="routetext">Route slippage<i className="fas fa-question-circle"></i></p>
                                                    <div className="route-marks">
                                                        <div>
                                                            <img src="imgs/smalldot.png" alt="" />
                                                            <p>DOT</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/smallbnb.png" alt="" />
                                                            <p>BNB</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/small-bnb-lp.png" alt="" />
                                                            <p>BNB-bSWAP LP</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className=" connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="route-slippage">
                                                    <p className="routetext">Route slippage<i className="fas fa-question-circle"></i></p>
                                                    <div className="route-marks">
                                                        <div>
                                                            <img src="imgs/smallada.png" alt="" />
                                                            <p>ADA</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/smallbnb.png" alt="" />
                                                            <p>BNB</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/small-bnb-lp.png" alt="" />
                                                            <p>BNB-bSWAP LP</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className=" connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="farmcard5">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Burn</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/need-jntr-b.png" alt="" />
                                                            <div className="npTISbx01Fly"><img src="imgs/big-bnb.png" alt="" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="route-slippage">
                                                    <p className="routetext">Route slippage<i className="fas fa-question-circle"></i></p>
                                                    <div className="route-marks">
                                                        <div>
                                                            <img src="imgs/small-ankor.png" alt="" />
                                                            <p>ANKR</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/smallbnb.png" alt="" />
                                                            <p>BNB</p>
                                                            <i className="fas fa-chevron-right"></i>
                                                        </div>
                                                        <div>
                                                            <img src="imgs/small-bnb-lp.png" alt="" />
                                                            <p>BNB-bSWAP LP</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className=" connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>period</li>
                                                        <li>APY</li>
                                                        <li>Your value</li>
                                                    </ul>
                                                    <ul>
                                                        <li>365 days <img src="imgs/chevroncard5.png" alt="" /></li>
                                                        <li>79.53%</li>
                                                        <li>0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img
                                                        className="dropdetailschevron" src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Your Cumulative
                                    <span>bSWAP reward:</span>
                                                            </li>
                                                            <li className="">Period Left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li><img src="imgs/brackets.png" alt="" />143.625</li>
                                                            <li>198 days</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="seemorecards">
                                    <a href="#">More burning pools options</a> <span className="columnspan">|</span> <a href="#">Launch your burning pool</a>
                                </div>
                                 */}
              </div>
            </div>
          </div>
        </div>
        <div className="Flexible-6">
          <div className="container">
            <div className="content">
              <div className="leftside">
                <p className="flex-p">Forging</p>
                <p className="text">
                  Forg allows users to stake bSWAP and earn other tokens.Users
                  can harvest token(s) at any time.If the tokens are harvested
                  before the farming period ends, you will NOT receive the APY
                  reward but do not earn a penalty
                </p>
                <img className="number" src="imgs/6.png" alt="" />
                <img className="prize" src="imgs/new-prize6.png" alt="" />
              </div>
              <div className="right-side">
                <div className="headings">
                  <div className="left">
                    <h2>Forging</h2>
                    <p className="togglegain">Forging bSWAP to earn tokens</p>
                  </div>
                </div>
                <div className="cmngSoonTitle01">COMING SOON</div>
                {/* <div className="twocards">
                                    <div className="owl-carousel owl-theme">
                                        <div className="item">
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-01.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-02.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-03.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-04.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet stakebswap">
                                                    <a href="#">Forge Now</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-01.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-04.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-05.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-05.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet stakebswap">
                                                    <a href="#">Forge Now</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-01.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-01.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-05.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-05.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet stakebswap">
                                                    <a href="#">Forge Now</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-01.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-02.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-03.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-04.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet stakebswap">
                                                    <a href="#">Forge Now</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-01.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-04.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-05.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-05.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet stakebswap">
                                                    <a href="#">Forge Now</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-01.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-01.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet">
                                                    <a href="#">Connect wallet</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="parkingcard6">
                                                <div className="top-part">
                                                    <div className="burn">
                                                        <p className="toptext">Forge</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-05.png" alt="" /> </div>
                                                    </div>
                                                    <div className="swapchevron">
                                                        <i className="fas fa-chevron-right"></i>
                                                    </div>
                                                    <div className="receiveAssets">
                                                        <p className="toptext">Recieve</p>
                                                        <div className="npTISbx01"><img src="imgs/forgIcon-05.png" alt="" /> </div>
                                                        <p className="chanegassets">Change Assets<i className="fas fa-caret-down"></i></p>
                                                    </div>
                                                </div>
                                                <div className="forgTitle01"> $0.000 <span>Total bSWAP farmed</span> </div>
                                                <div className="stakefarm connectwallet stakebswap">
                                                    <a href="#">Forge Now</a>
                                                </div>
                                                <div className="twolist">
                                                    <ul>
                                                        <li>APY:</li>
                                                        <li>Your stake:</li>
                                                    </ul>
                                                    <ul>
                                                        <li>79.53%</li>
                                                        <li className='npImgFix01'> <img src="imgs/small-bnb-lp-2.png" /> 0.0000</li>
                                                    </ul>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li className="bSWAPreward">Token smart contract:</li>
                                                            <li className="">Your total reward:</li>
                                                            <li className="">Period left:</li>
                                                        </ul>
                                                        <ul>
                                                            <li className="orangeColor">0x0843...6a80</li>
                                                            <li>0.0000</li>
                                                            <li>112 days</li>
                                                            <li className="withdraw">Withdraw<span className="icon-question"></span></li>
                                                        </ul>
                                                    </div>
                                                    <div className="forginLinkBx01">
                                                        <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                        <a href="#" className="viewprojects">View Projects Liquidity <i className="fas fa-external-link-alt"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="seemorecards">
                                    <a href="#">More parking pools options</a> <span className="columnspan">|</span> <a href="#">Launch your parking
        pool</a>
                                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="Flexible-7">
          <div className="container">
            <div className="content">
              <div className="leftside">
                <p className="flex-p">Welcome Bonus</p>
                <p className="text">
                  Big reward for new adopters of the BSC network - simply send
                  ETH and receive more BEP20 token with an APY staking program{' '}
                </p>
                <img className="number" src="imgs/7.png" alt="" />
                <img className="prize" src="imgs/new-prize7.png" alt="" />
              </div>
              <div className="right-side">
                <div className="headings">
                  <div className="left">
                    <h2>Welcome Bonus</h2>
                    <p className="togglegain">
                      Welcome ETH to Binance Smart Chain
                    </p>
                  </div>
                </div>
                <div className="cmngSoonTitle01">COMING SOON</div>
                {/* <div className="twocards">
                                    <div className="owl-carousel owl-theme">
                                        <div className="item">
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>bSWAP</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>DOT</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow connectwallet">
                                                    <a href="#">connect wallet</a>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>ANKAR</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>ANKAR</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-cog"></i> </a>
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                                <div className="sociallinkscard">
                                                    <div className="more-info">
                                                        <div className="info-social">
                                                            <p className="askquestion">
                                                                Official site
                        </p>
                                                            <a href="#">https://www.website.com</a>
                                                        </div>
                                                        <div className="info-social">
                                                            <p className="askquestion">
                                                                Token smart contract
                        </p>
                                                            <a href="#">07A8...605B5</a>
                                                        </div>
                                                        <div className="info-social">
                                                            <p className="askquestion">
                                                                Token staking contract
                        </p>
                                                            <a href="#">07A8...605B5</a>
                                                        </div>
                                                        <div className="info-social">
                                                            <p className="askquestion">
                                                                KYC equired?
                        </p>
                                                            <a href="#">Yes</a>
                                                        </div>
                                                    </div>
                                                    <div className="social-links">
                                                        <a href="#">
                                                            <i className="fas fa-paper-plane"></i>
                                                        </a>
                                                        <a href="#">
                                                            <i className="fab fa-linkedin-in"></i>
                                                        </a>
                                                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                                                        <a href="#"><i className="fab fa-twitter"></i></a>
                                                        <a href="#"><i className="fab fa-reddit-alien"></i></a>
                                                        <a href="#"><i className="fab fa-medium-m"></i></a>
                                                        <a href="#"><i className="fas fa-chart-bar"></i></a>
                                                        <a href="#"><i className="fab fa-instagram"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>ANKAR</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>ANKAR</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>bSWAP</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>DOT</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow connectwallet">
                                                    <a href="#">connect wallet</a>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>ANKAR</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>ANKAR</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-cog"></i> </a>
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                                <div className="sociallinkscard">
                                                    <div className="more-info">
                                                        <div className="info-social">
                                                            <p className="askquestion">
                                                                Official site
                        </p>
                                                            <a href="#">https://www.website.com</a>
                                                        </div>
                                                        <div className="info-social">
                                                            <p className="askquestion">
                                                                Token smart contract
                        </p>
                                                            <a href="#">07A8...605B5</a>
                                                        </div>
                                                        <div className="info-social">
                                                            <p className="askquestion">
                                                                Token staking contract
                        </p>
                                                            <a href="#">07A8...605B5</a>
                                                        </div>
                                                        <div className="info-social">
                                                            <p className="askquestion">
                                                                KYC equired?
                        </p>
                                                            <a href="#">Yes</a>
                                                        </div>
                                                    </div>
                                                    <div className="social-links">
                                                        <a href="#">
                                                            <i className="fas fa-paper-plane"></i>
                                                        </a>
                                                        <a href="#">
                                                            <i className="fab fa-linkedin-in"></i>
                                                        </a>
                                                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                                                        <a href="#"><i className="fab fa-twitter"></i></a>
                                                        <a href="#"><i className="fab fa-reddit-alien"></i></a>
                                                        <a href="#"><i className="fab fa-medium-m"></i></a>
                                                        <a href="#"><i className="fas fa-chart-bar"></i></a>
                                                        <a href="#"><i className="fab fa-instagram"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>ANKAR</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                            </div>
                                            <div className="bonuscard7">
                                                <div className="heading">
                                                    <h2>ANKAR</h2>
                                                    <div className="bnsCardLinkBox01">
                                                        <a href="#"> <i className="fas fa-info-circle"></i> </a>
                                                    </div>
                                                </div>
                                                <div className="twolistcard7">
                                                    <ul>
                                                        <li>Send</li>
                                                        <li>Receive</li>
                                                        <li>Staking Included</li>
                                                        <li>Staking Period <i className="fas fa-question-circle"></i></li>
                                                        <li>APY <i className="fas fa-question-circle"></i></li>
                                                    </ul>
                                                    <ul>
                                                        <li>.01 ETH <span>(~$1)</span> </li>
                                                        <li>1,000 JNTR <span>(~$100)</span> </li>
                                                        <li>Yes</li>
                                                        <li>90 days</li>
                                                        <li>50%</li>
                                                    </ul>
                                                </div>
                                                <div className="stakenow ">
                                                    <a href="#">claim your bonus</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="seemorecards">
                                    <a href="#">See More welcome bonus</a> <span className="columnspan">|</span> <a href="#">Launch your welcome bonus</a>
                                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="Flexible-8">
          <div className="container">
            <div className="content">
              <div className="leftside">
                <p className="flex-p">IDO</p>
                <p className="text">
                  Buy tokens directly from a DAO without slippage and with an
                  available liquidity pool.
                </p>
                <img className="number" src="imgs/8.png" alt="" />
                <img className="prize" src="imgs/prize-8.png" alt="" />
              </div>
              <div className="right-side">
                <div className="headings">
                  <div className="left">
                    <h2>IDO</h2>
                    <p className="togglegain">
                      Initial DEX offerings from companies launching in bSWAP.
                    </p>
                  </div>
                </div>
                <div className="cmngSoonTitle01">COMING SOON</div>
                {/* <div className="twocards">
                                    <div className="owl-carousel owl-theme">
                                        <div className="item">
                                            <div className="idocard8">
                                                <div className="smart-auc">
                                                    <div className="img">
                                                        <img src="imgs/smart8.png" alt="" />
                                                        <div>
                                                            <p>SMRT</p>
                                                            <span>SMART</span>
                                                        </div>
                                                    </div>
                                                    <div className="type">
                                                        <p>Dutch Auction<span className="icon-question"></span></p>
                                                        <span>484.13% APY
                                        </span>
                                                    </div>
                                                </div>
                                                <div className="line">
                                                    <span className="progress100"></span>
                                                </div>
                                                <div className=" nexauctioncomp">
                                                    <span className="nextauction">Current IDO ends in </span>
                                                    <div className="countspan">
                                                        <div className="1">
                                                            <span>1</span>
                                                            <span>1</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="2">
                                                            <span>2</span>
                                                            <span>4</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="3">
                                                            <span>5</span>
                                                            <span>6</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="4">
                                                            <span>3</span>
                                                            <span>4</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="connectyourwallet">
                                                    <a href="#">connect your wallet</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="liveStatusLink"><i className="dotGreen"></i>  Live #104</a>
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>IDO type</li>
                                                            <li>Launch Time </li>
                                                            <li>For Sale</li>
                                                            <li>Soft cap</li>
                                                            <li>Minimum to raise (USD)</li>
                                                            <li>tOTAL raised (% of target )</li>
                                                            <li>Staking period </li>
                                                            <li>APY</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Dutch Auction</li>
                                                            <li>Nov.20,9PM SGT</li>
                                                            <li>100,000,000 DOT</li>
                                                            <li>(USD) $1,000,000</li>
                                                            <li>(USD) $5,000,000</li>
                                                            <li>$1,000,000</li>
                                                            <li className="yellowli">484.13%</li>
                                                            <li>30days</li>
                                                            <li>152%</li>
                                                        </ul>
                                                        <div className="box8LinkMBox">
                                                            <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                            <a href="#" className="viewprojects">View Project liquidity <i className="fas fa-external-link-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="idocard8">
                                                <div className="smart-auc">
                                                    <div className="img">
                                                        <img src="imgs/bswap8.png" alt="" />
                                                        <div>
                                                            <p>bSWAP</p>
                                                            <span>bSWAP</span>
                                                        </div>
                                                    </div>
                                                    <div className="type">
                                                        <p>Fix Sale<span className="icon-question"></span></p>
                                                        <span className="nostaking">No Staking
                                        </span>
                                                    </div>
                                                </div>
                                                <div className="line">
                                                    <span className="progress50"></span>
                                                </div>
                                                <div className=" nexauctioncomp">
                                                    <span className="nextauction">Current IDO ends in </span>
                                                    <div className="countspan">
                                                        <div className="1">
                                                            <span>1</span>
                                                            <span>1</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="2">
                                                            <span>2</span>
                                                            <span>4</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="3">
                                                            <span>5</span>
                                                            <span>6</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="4">
                                                            <span>3</span>
                                                            <span>4</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="connectyourwallet">
                                                    <a href="#">connect your wallet</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="liveStatusLink"><i className="dotGreen"></i>  Live #104</a>
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>IDO type</li>
                                                            <li>Launch Time </li>
                                                            <li>For Sale</li>
                                                            <li>Soft cap</li>
                                                            <li>Minimum to raise (USD)</li>
                                                            <li>tOTAL raised (% of target )</li>
                                                            <li>Staking period </li>
                                                            <li>APY</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Dutch Auction</li>
                                                            <li>Nov.20,9PM SGT</li>
                                                            <li>100,000,000 DOT</li>
                                                            <li>(USD) $1,000,000</li>
                                                            <li>(USD) $5,000,000</li>
                                                            <li>$1,000,000</li>
                                                            <li className="yellowli">484.13%</li>
                                                            <li>30days</li>
                                                            <li>152%</li>
                                                        </ul>
                                                        <div className="box8LinkMBox">
                                                            <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                            <a href="#" className="viewprojects">View Project liquidity <i className="fas fa-external-link-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="idocard8">
                                                <div className="smart-auc">
                                                    <div className="img">
                                                        <img src="imgs/dotpool.png" alt="" />
                                                        <div>
                                                            <p>DOT</p>
                                                            <span>Polkadot</span>
                                                        </div>
                                                    </div>
                                                    <div className="type">
                                                        <p>Dutch Auction<span className="icon-question"></span></p>
                                                        <span>484.13% APY
                                        </span>
                                                    </div>
                                                </div>
                                                <div className="line">
                                                    <span className="progress100"></span>
                                                </div>
                                                <div className=" nexauctioncomp">
                                                    <span className="nextauction">Current IDO ends in </span>
                                                    <div className="countspan">
                                                        <div className="1">
                                                            <span>1</span>
                                                            <span>1</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="2">
                                                            <span>2</span>
                                                            <span>4</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="3">
                                                            <span>5</span>
                                                            <span>6</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="4">
                                                            <span>3</span>
                                                            <span>4</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="connectyourwallet">
                                                    <a href="#">connect your wallet</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="liveStatusLink"><i className="dotGreen"></i>  Live #104</a>
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>IDO type</li>
                                                            <li>Launch Time </li>
                                                            <li>For Sale</li>
                                                            <li>Soft cap</li>
                                                            <li>Minimum to raise (USD)</li>
                                                            <li>tOTAL raised (% of target )</li>
                                                            <li>Staking period </li>
                                                            <li>APY</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Dutch Auction</li>
                                                            <li>Nov.20,9PM SGT</li>
                                                            <li>100,000,000 DOT</li>
                                                            <li>(USD) $1,000,000</li>
                                                            <li>(USD) $5,000,000</li>
                                                            <li>$1,000,000</li>
                                                            <li className="yellowli">484.13%</li>
                                                            <li>30days</li>
                                                            <li>152%</li>
                                                        </ul>
                                                        <div className="box8LinkMBox">
                                                            <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                            <a href="#" className="viewprojects">View Project liquidity <i className="fas fa-external-link-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="idocard8">
                                                <div className="smart-auc">
                                                    <div className="img">
                                                        <img src="imgs/adapool.png" alt="" />
                                                        <div>
                                                            <p>ADA</p>
                                                            <span>Cardano</span>
                                                        </div>
                                                    </div>
                                                    <div className="type">
                                                        <p>Fix Sale<span className="icon-question"></span></p>
                                                        <span>No Staking
                                        </span>
                                                    </div>
                                                </div>
                                                <div className="line">
                                                    <span className="progress50"></span>
                                                </div>
                                                <div className=" nexauctioncomp">
                                                    <span className="nextauction">Current IDO ends in </span>
                                                    <div className="countspan">
                                                        <div className="1">
                                                            <span>1</span>
                                                            <span>1</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="2">
                                                            <span>2</span>
                                                            <span>4</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="3">
                                                            <span>5</span>
                                                            <span>6</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="4">
                                                            <span>3</span>
                                                            <span>4</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="invest">
                                                    <div className="input-group">
                                                        <div className="leftimg">
                                                            <img src="imgs/bnb.png" alt="" />
                                                            <a href="javascript:void(0);" className="ddBTN popupLink" data-id="#ddM01"><i className="fas fa-caret-down"></i></a>
                                                            <div className="ddContent" id='ddM01'>
                                                                <a href="javascript:void(0);"><img src="imgs/bnb.png" alt="" /> BNB</a>
                                                                <a href="javascript:void(0);"><img src="imgs/pureEth.png" alt="" /> ETH</a>
                                                            </div>
                                                        </div>
                                                        <input type="text" placeholder="1.2535" />
                                                        <button type="submit">Invest</button>
                                                        <div className="inputStextBx ">
                                                            <span>MAX</span>
                                                            <span>[$139.85]</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="liveStatusLink"><i className="dotGreen"></i>  Live #104</a>
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>IDO type</li>
                                                            <li>Launch Time </li>
                                                            <li>For Sale</li>
                                                            <li>Soft cap</li>
                                                            <li>Minimum to raise (USD)</li>
                                                            <li>tOTAL raised (% of target )</li>
                                                            <li>Staking period </li>
                                                            <li>APY</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Dutch Auction</li>
                                                            <li>Nov.20,9PM SGT</li>
                                                            <li>100,000,000 DOT</li>
                                                            <li>(USD) $1,000,000</li>
                                                            <li>(USD) $5,000,000</li>
                                                            <li>$1,000,000</li>
                                                            <li className="yellowli">484.13%</li>
                                                            <li>30days</li>
                                                            <li>152%</li>
                                                        </ul>
                                                        <div className="box8LinkMBox">
                                                            <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                            <a href="#" className="viewprojects">View Project liquidity <i className="fas fa-external-link-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item">
                                            <div className="idocard8">
                                                <div className="smart-auc">
                                                    <div className="img">
                                                        <img src="imgs/smart8.png" alt="" />
                                                        <div>
                                                            <p>SMRT</p>
                                                            <span>SMART</span>
                                                        </div>
                                                    </div>
                                                    <div className="type">
                                                        <p>Dutch Auction<span className="icon-question"></span></p>
                                                        <span>484.13% APY
                                        </span>
                                                    </div>
                                                </div>
                                                <div className="line">
                                                    <span className="progress100"></span>
                                                </div>
                                                <div className=" nexauctioncomp">
                                                    <span className="nextauction">Current IDO ends in </span>
                                                    <div className="countspan">
                                                        <div className="1">
                                                            <span>1</span>
                                                            <span>1</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="2">
                                                            <span>2</span>
                                                            <span>4</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="3">
                                                            <span>5</span>
                                                            <span>6</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="4">
                                                            <span>3</span>
                                                            <span>4</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="connectyourwallet">
                                                    <a href="#">connect your wallet</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="liveStatusLink"><i className="dotGreen"></i>  Live #104</a>
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>IDO type</li>
                                                            <li>Launch Time </li>
                                                            <li>For Sale</li>
                                                            <li>Soft cap</li>
                                                            <li>Minimum to raise (USD)</li>
                                                            <li>tOTAL raised (% of target )</li>
                                                            <li>Staking period </li>
                                                            <li>APY</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Dutch Auction</li>
                                                            <li>Nov.20,9PM SGT</li>
                                                            <li>100,000,000 DOT</li>
                                                            <li>(USD) $1,000,000</li>
                                                            <li>(USD) $5,000,000</li>
                                                            <li>$1,000,000</li>
                                                            <li className="yellowli">484.13%</li>
                                                            <li>30days</li>
                                                            <li>152%</li>
                                                        </ul>
                                                        <div className="box8LinkMBox">
                                                            <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                            <a href="#" className="viewprojects">View Project liquidity <i className="fas fa-external-link-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="idocard8">
                                                <div className="smart-auc">
                                                    <div className="img">
                                                        <img src="imgs/bswap8.png" alt="" />
                                                        <div>
                                                            <p>bSWAP</p>
                                                            <span>bSWAP</span>
                                                        </div>
                                                    </div>
                                                    <div className="type">
                                                        <p>Fix Sale<span className="icon-question"></span></p>
                                                        <span className="nostaking">No Staking
                                        </span>
                                                    </div>
                                                </div>
                                                <div className="line">
                                                    <span className="progress50"></span>
                                                </div>
                                                <div className=" nexauctioncomp">
                                                    <span className="nextauction">Current IDO ends in </span>
                                                    <div className="countspan">
                                                        <div className="1">
                                                            <span>1</span>
                                                            <span>1</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="2">
                                                            <span>2</span>
                                                            <span>4</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="3">
                                                            <span>5</span>
                                                            <span>6</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="4">
                                                            <span>3</span>
                                                            <span>4</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="connectyourwallet">
                                                    <a href="#">connect your wallet</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="liveStatusLink"><i className="dotGreen"></i>  Live #104</a>
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>IDO type</li>
                                                            <li>Launch Time </li>
                                                            <li>For Sale</li>
                                                            <li>Soft cap</li>
                                                            <li>Minimum to raise (USD)</li>
                                                            <li>tOTAL raised (% of target )</li>
                                                            <li>Staking period </li>
                                                            <li>APY</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Dutch Auction</li>
                                                            <li>Nov.20,9PM SGT</li>
                                                            <li>100,000,000 DOT</li>
                                                            <li>(USD) $1,000,000</li>
                                                            <li>(USD) $5,000,000</li>
                                                            <li>$1,000,000</li>
                                                            <li className="yellowli">484.13%</li>
                                                            <li>30days</li>
                                                            <li>152%</li>
                                                        </ul>
                                                        <div className="box8LinkMBox">
                                                            <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                            <a href="#" className="viewprojects">View Project liquidity <i className="fas fa-external-link-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="idocard8">
                                                <div className="smart-auc">
                                                    <div className="img">
                                                        <img src="imgs/dotpool.png" alt="" />
                                                        <div>
                                                            <p>DOT</p>
                                                            <span>Polkadot</span>
                                                        </div>
                                                    </div>
                                                    <div className="type">
                                                        <p>Dutch Auction<span className="icon-question"></span></p>
                                                        <span>484.13% APY
                                        </span>
                                                    </div>
                                                </div>
                                                <div className="line">
                                                    <span className="progress100"></span>
                                                </div>
                                                <div className=" nexauctioncomp">
                                                    <span className="nextauction">Current IDO ends in </span>
                                                    <div className="countspan">
                                                        <div className="1">
                                                            <span>1</span>
                                                            <span>1</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="2">
                                                            <span>2</span>
                                                            <span>4</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="3">
                                                            <span>5</span>
                                                            <span>6</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="4">
                                                            <span>3</span>
                                                            <span>4</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="connectyourwallet">
                                                    <a href="#">connect your wallet</a>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="liveStatusLink"><i className="dotGreen"></i>  Live #104</a>
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>IDO type</li>
                                                            <li>Launch Time </li>
                                                            <li>For Sale</li>
                                                            <li>Soft cap</li>
                                                            <li>Minimum to raise (USD)</li>
                                                            <li>tOTAL raised (% of target )</li>
                                                            <li>Staking period </li>
                                                            <li>APY</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Dutch Auction</li>
                                                            <li>Nov.20,9PM SGT</li>
                                                            <li>100,000,000 DOT</li>
                                                            <li>(USD) $1,000,000</li>
                                                            <li>(USD) $5,000,000</li>
                                                            <li>$1,000,000</li>
                                                            <li className="yellowli">484.13%</li>
                                                            <li>30days</li>
                                                            <li>152%</li>
                                                        </ul>
                                                        <div className="box8LinkMBox">
                                                            <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                            <a href="#" className="viewprojects">View Project liquidity <i className="fas fa-external-link-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="idocard8">
                                                <div className="smart-auc">
                                                    <div className="img">
                                                        <img src="imgs/adapool.png" alt="" />
                                                        <div>
                                                            <p>ADA</p>
                                                            <span>Cardano</span>
                                                        </div>
                                                    </div>
                                                    <div className="type">
                                                        <p>Fix Sale<span className="icon-question"></span></p>
                                                        <span>No Staking
                                        </span>
                                                    </div>
                                                </div>
                                                <div className="line">
                                                    <span className="progress50"></span>
                                                </div>
                                                <div className=" nexauctioncomp">
                                                    <span className="nextauction">Current IDO ends in </span>
                                                    <div className="countspan">
                                                        <div className="1">
                                                            <span>1</span>
                                                            <span>1</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="2">
                                                            <span>2</span>
                                                            <span>4</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="3">
                                                            <span>5</span>
                                                            <span>6</span>
                                                        </div>
                                                        <span className="colon">:</span>
                                                        <div className="4">
                                                            <span>3</span>
                                                            <span>4</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="invest">
                                                    <div className="input-group">
                                                        <div className="leftimg">
                                                            <img src="imgs/bnb.png" alt="" />
                                                        </div>
                                                        <input type="text" placeholder="1.2535" />
                                                        <button type="submit">Invest</button>
                                                        <span className="lastnum">[$139.85]</span>
                                                    </div>
                                                </div>
                                                <div className="details">
                                                    <a href="#" className="liveStatusLink"><i className="dotGreen"></i>  Live #104</a>
                                                    <a href="#" className="detailsLink"><span>details</span> <img className="dropdetailschevron"
                                                        src="imgs/down.png" alt="" /></a>
                                                </div>
                                                <div className="dropdownlist">
                                                    <div className="dropdowntwolist">
                                                        <ul>
                                                            <li>IDO type</li>
                                                            <li>Launch Time </li>
                                                            <li>For Sale</li>
                                                            <li>Soft cap</li>
                                                            <li>Minimum to raise (USD)</li>
                                                            <li>tOTAL raised (% of target )</li>
                                                            <li>Staking period </li>
                                                            <li>APY</li>
                                                        </ul>
                                                        <ul>
                                                            <li>Dutch Auction</li>
                                                            <li>Nov.20,9PM SGT</li>
                                                            <li>100,000,000 DOT</li>
                                                            <li>(USD) $1,000,000</li>
                                                            <li>(USD) $5,000,000</li>
                                                            <li>$1,000,000</li>
                                                            <li className="yellowli">484.13%</li>
                                                            <li>30days</li>
                                                            <li>152%</li>
                                                        </ul>
                                                        <div className="box8LinkMBox">
                                                            <a href="#" className="viewprojects">View Projects Info <i className="fas fa-external-link-alt"></i></a>
                                                            <a href="#" className="viewprojects">View Project liquidity <i className="fas fa-external-link-alt"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="seemorecards">
                                    <a href="#">More parking pools options</a> <span className="columnspan">|</span> <a href="#">Launch your parking
                        pool</a>
                                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="Flexible-9">
          <div className="container">
            <div className="content">
              <div className="leftside">
                <p className="flex-p">
                  deFi <br />
                  auctions
                </p>
                <p className="text">
                  increase your assets <br />
                  with daily incentives
                </p>
                <p className="number">9</p>
              </div>
              <div className="right-side">
                <div className="headings">
                  <div className="left">
                    {' '}
                    <a href="#">Go to Live Auction</a>{' '}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer">
          <div className="container">
            <div className="footer-content">
              <ul>
                <li>
                  <a href="#">List new token </a>
                </li>
                <li>
                  <a href="#">Upgrade to v2</a>
                </li>
                <li>
                  <a href="#">launchField</a>
                </li>
                <li>
                  <a href="#">voting</a>
                </li>
                <li>
                  <a href="#">github</a>
                </li>
                <li>
                  <a href="#">medium</a>
                </li>
                <li>
                  <a href="#">telegram</a>
                </li>
                <li>
                  <a href="#">twitter</a>
                </li>
                <li>
                  <a href="#">discord</a>
                </li>
              </ul>
              <ul>
                <li>
                  <span style={{ marginRight: '5px' }}>
                    Powered by Atom Foundation:
                  </span>
                  <a href="#">Jointer.io</a>
                </li>
                {/* <li><a href="#">BSCbonus.com</a></li> */}
                <li>
                  <a href="#">SmartSwap.exchange</a>
                </li>
                <li>
                  <a href="#">ZERO/1</a>
                </li>
                <li>
                  <a href="#">DegenSwap.io</a>
                </li>
                <li>
                  <a href="#">ElementZero.network</a>
                </li>
                <li>
                  <a href="#">Packey.insure</a>
                </li>
                <li>
                  <a href="#">Mass.investments</a>
                </li>
              </ul>
            </div>
          </div>
          <a href="#" className="eth-logo">
            <img src="imgs/etherLOGO.png" alt="" />
          </a>
          <a href="#" className="binance-logo">
            <img src="imgs/binancelogo.png" alt="" />
          </a>
          <a href="#" className="boy-logo">
            <img src="imgs/fighter-icon.png" alt="" />
          </a>
        </div>
        <Popup
          popupData={this.state.popupData}
          termStakingList={this.state.termStakingList}
          stakeToken={this.stakeToken.bind(this)}
        ></Popup>
        <IDOForm
          popupData={this.state.popupData}
          termStakingList={this.state.termStakingList}
          connectWallet={this.connectWallet.bind(this)}
          createPool={this.createPool.bind(this)}
          web3={this.state.web3}
        ></IDOForm>
      </div>
    );
  }
}

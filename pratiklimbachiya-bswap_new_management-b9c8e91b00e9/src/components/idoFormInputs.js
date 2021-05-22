import React from "react";
import PropTypes from "prop-types";
import { checkAddress } from "../helper/generalFunction";
import web3Config from "../config/web3Config";

const { useState, useEffect } = React;


export default function IDOFormInputs(props) {

    const { handleData, ...rest } = props;
    const [inputList, setInputList] = useState([{ stackToken: "", period: 0, rate: 0 }]);

    const handleInputChange = async (e, index) => {
        const { name, value } = e.target;
        if (name === "stackToken") {
            await checkAddress(props.web3, value)
        }
        const list = [...inputList];
        list[index][name] = value;
        setInputList(list);
        handleData(list);
    };

    // handle click event of the Remove button
    const handleRemoveClick = index => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
        handleData(list);
    };

    // handle click event of the Add button
    const handleAddClick = () => {
        setInputList([...inputList, { stackToken: "", period: 0, rate: 0 }]);
        const list = [...inputList];
        handleData(list);
    };

    const floatOnly = (event) => {
        if (event.shiftKey === true)
            event.preventDefault();

        var code = event.keyCode;

        if ((code >= 48 && code <= 57) || (code >= 96 && code <= 105) || code === 8 || code === 9 || code === 37 || code === 39 || code === 46 || code === 190 || code === 110) {
            // allowed characters
        } else
            event.preventDefault();

        if (event.target.value.indexOf('.') !== -1 && (code === 190 || code === 110))
            event.preventDefault();
    }


    const intOnly = (event) => {
        if (event.shiftKey === true)
            event.preventDefault();

        var code = event.keyCode;

        if ((code >= 48 && code <= 57) || (code >= 96 && code <= 105) || code === 8 || code === 9 || code === 37 || code === 39 || code === 46) {
            // allowed characters
        } else
            event.preventDefault();
    }

    const clearValue = (e, index) => {
        const { name } = e.target;
        const list = [...inputList];
        list[index][name] = "";
        setInputList(list);
        handleData(list);
    }

    return (
        <div>
            {inputList.map((x, i) => {

                return (

                    // <div className="jwb-BonusFormMbox" key={`bonus-${i}`}>
                    //     {inputList.length !== 1 &&
                    //         <a onClick={() => handleRemoveClick(i)} className="jwb-DelectLink">X</a>
                    //     }
                    //     <div className="jwb-BonusTitle01">Bonus #{i + 1}</div>
                    //     <div className="jwb-BonusFMbox">
                    //         <div className="jwb-BonusFSbox01">
                    //             <div className="jwb-bfBX01">User sends ETH<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-title="Choose how much ETH users need to send" data-pt-position="top" aria-hidden="true"></i></i> </div>
                    //             <div className="jwb-bfBX02"><div className="jwb-input01"><input type="text" value={x.eth} name="eth" onChange={e => handleInputChange(e, i)} onKeyDown={e => floatOnly(e)} /></div>  </div>
                    //         </div>
                    //         <div className="jwb-BonusFSbox02">
                    //             <div className="jwb-bfBX01">User receives BEP20 (your token)<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-title="Choose how much of your token users will receive" data-pt-position="top" aria-hidden="true"></i></i> </div>
                    //             <div className="jwb-bfBX02"><div className="jwb-input01 "><input type="text" value={x.token} name="token" onChange={e => handleInputChange(e, i)} onKeyDown={e => floatOnly(e)} /></div>  </div>
                    //         </div>
                    //     </div>
                    //     <div className="jwb-BonusFMbox">
                    //         <div className="jwb-BonusFSbox01">
                    //             <div className="jwb-bfBX01">Staking Period<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-title="Time period the tokens will be locked 
                    //                 before releasing to users" data-pt-position="top" aria-hidden="true"></i></i> (Days) </div>
                    //             <div className="jwb-bfBX02"><div className="jwb-input01 "><input type="text" value={x.period} name="period" onChange={e => handleInputChange(e, i)} onKeyDown={e => intOnly(e)} /></div>  </div>
                    //         </div>
                    //         <div className="jwb-BonusFSbox02">
                    //             <div className="jwb-bfBX01">APY<i className="help-circle"><i className="fas fa-question-circle protip" data-pt-title="Annual Percentage Yield" data-pt-position="top" aria-hidden="true"></i></i> (Percentage)</div>
                    //             <div className="jwb-bfBX02"><div className="jwb-input01 "><input type="text" value={x.rate} name="rate" onChange={e => handleInputChange(e, i)} onKeyDown={e => floatOnly(e)} /></div>  </div>
                    //         </div>
                    //     </div>
                    // </div>

                    <div className="four-input">
                        <div className="npHodlTitle">HODL #{i + 1}
                            {inputList.length !== 1 &&
                                <a onClick={() => handleRemoveClick(i)} className="npCloseBtn"></a>
                            }
                        </div>
                        <div className="main-input-group">
                            <p className="white plexmono medium-weight  size-18">
                                Place here the staking token smart contract address
                                        <span className="icon-question">
                                    <span className="popuptoolkit" style={{ display: 'none' }}> That will be the token that you will reward users with </span>
                                </span>
                            </p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="0x3c037c4c2296f280bb318d725d0b454b76c199b9"
                                    id="stackTokens"
                                    value={x.stackToken}
                                    name="stackToken"
                                    onChange={e => handleInputChange(e, i)}
                                    // onKeyDown={e => floatOnly(e)}
                                    onFocus={e => clearValue(e, i)}
                                    autoComplete="off"
                                />
                                <p className="sidetxt size-18 white plexmono">
                                    {/* {this.state.idoFormData.rewardToken} */}
                                </p>
                            </div>
                        </div>
                        <div className="main-input-group">

                        </div>
                        <div className="main-input-group">
                            <p className="white plexmono medium-weight  size-18">
                                Choose the period of holding{" "}
                            </p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder=""
                                    id="period"
                                    value={x.period}
                                    name="period"
                                    onChange={e => handleInputChange(e, i)}
                                    onKeyDown={e => intOnly(e)}
                                    onFocus={e => clearValue(e, i)}
                                    autoComplete="off"
                                />
                                <p className="sidetxt size-18 white plexmono">Days</p>
                            </div>
                        </div>
                        <div className="main-input-group">
                            <p className="white plexmono medium-weight  size-18">
                                Choose the APY reward
                                <span className="icon-question"></span>
                            </p>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder=""
                                    id="rate"
                                    value={x.rate}
                                    name="rate"
                                    onChange={e => handleInputChange(e, i)}
                                    onKeyDown={e => floatOnly(e)}
                                    onFocus={e => clearValue(e, i)}
                                    autoComplete="off"
                                />
                                <p className="sidetxt size-18 white plexmono">%</p>
                            </div>
                        </div>
                    </div>


                )

            })
            }


            {/* <div className="jwb-addBonusBar"><a onClick={handleAddClick}>Add another bonus</a></div> */}
            <div className="npHodlTitle"><a onClick={handleAddClick}>Add New Hodl </a></div>

        </div>

    )

}

IDOFormInputs.propTypes = {
    handleData: PropTypes.func
};
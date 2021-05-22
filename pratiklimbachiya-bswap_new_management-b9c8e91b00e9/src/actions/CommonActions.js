import dispatcher from "../dispatcher";
import axios from 'axios';

export function SEND_POST_REQUEST(route, data, type, accessToken = null) {
    let headers;
    if (accessToken !== null) {
        headers = {
            'Authorization': 'Bearer ' + accessToken
        }
    }
    axios.post(route, data, { headers: headers }).then(function (response) {
        dispatcher.dispatch({ type: type, resp_code: 1, data: response.data })
    }).catch(function (error) {
        let errString = ''
        if (error.response !== undefined)
            errString = error.response.data
        else
            errString = error.toString()
        // _msgStore.error("",errString,"err_ajax")
        dispatcher.dispatch({ type: type, resp_code: -1, data: errString })
    });
}

export function SEND_GET_REQUEST(route, type) {
    axios.get(route).then(function (response) {
        dispatcher.dispatch({ type: type, resp_code: 1, data: response.data })
    }).catch(function (error) {
        let errString = ''
        //  if (error.response!== undefined)
        //      errString = _msgStore.makeErrorCode(error.response.status)
        //  else
        errString = error.toString()
        //  _msgStore.error("",errString,"err_ajax")
        dispatcher.dispatch({ type: type, resp_code: -1, data: errString })
    });
}
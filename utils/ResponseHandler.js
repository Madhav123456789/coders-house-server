// this is statemanager for ResponseHandler
class StateManager {
    #ErrorMessageG51Status;
    #ErrorMessageG51;
    #Response;

    setMsg(msg) {
        this.#ErrorMessageG51 = msg;
    }

    getMsg() {
        return this.#ErrorMessageG51;
    }

    setStatus(status) {
        this.#ErrorMessageG51Status = status;
    }

    getStatus() {
        return this.#ErrorMessageG51Status;
    }

    setResponse(res) {
        this.#Response = res;
    }

    getResponse() {
        return this.#Response;
    }
}

class ResponseHandler {
    #State;
    #default;

    constructor(Default , res) {
        // creating instance of statemanager
        this.#State = new StateManager();
        // setting response object
        this.#State.setResponse(res);
        if (!Default) {
            this.#default = 500
        } else {
            this.#default = Default;
        }
    };

    // this function will be used to create error response
    NeedError = (msg, status) => {
        this.#State.setStatus(status);
        this.#State.setMsg(msg);

        this.#State.getResponse().status(status ? this.#State.getStatus() : msg?this.#default:500).json({
            msg: msg ? this.#State.getMsg() : "Internal Server Error",
            flag: false
        });
    }

    // this function will be used to set default response error code
    setStatus(code) {
        this.#default = code;
    }

    // this function will be used to set res without constructer
    reset(res , status) {
        // validating if note response
        if (!res) {
            throw new Error("Response object requires");
        }

        if(status){
            this.#default = status;
        }

        // setting response object
        this.#State.setResponse(res);
    };

    // this function will be used to send ok responses
    NeedExec = (msg, extra = null) => {
        // creating object with conditions
        if (extra) {
            // creating an object to store data
            extra.flag = true;
            if (msg) {
                extra.msg = msg;
            }
            // sending the conditions
            return this.#State.getResponse().json(extra);
        } else {
            return this.#State.getResponse().json({
                msg: msg,
                flag: true
            });
        }
    }
}

module.exports = ResponseHandler;
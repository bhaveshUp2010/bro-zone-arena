class ApiResponse{
    constructor(statusCode, data, msg){
        this.data = data,
        this.message = msg,
        this.msg,
        this.succes = statusCode < 400
    }
}

export {ApiResponse}
export class ApiResponse {
    public code:string;
    public message:string;
    public data:any;
    public meta:any;
}

export const ResponseCodes = {
    SUCCESS:{
        code:'000',
        message:'success'
    },
    FAILED:{
        code:'001',
        message:'failed'
    },
    NO_RECORD_FOUND:{
        code:'404',
        message:'no record found'
    },
    AUTHENTICATION_FAILED:{
        code:'002',
        message:'authentication failed',
    },
    ACCESS_TOKEN_EXPIRED:{
        code:'003',
        message:'access token has expired'
    },
    INACTIVE_ACCOUNT:{
        code:'004',
        message:'inactive account'
    },
    EXPECTION_ERROR:{
        code:'500',
        message:'internal server error'
    }

}


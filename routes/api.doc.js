        /**
         * @api {get} /verification/:phone 1- Request Send verification code
         * @apiName verification
         * @apiGroup User
         *
         * @apiParam {string} phone Users.
         *
         * @apiSuccess {Boolead} Success if Success true next, else show error.
         */

         ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
         * @api {get} /checkVerificationCode/:phone/:code 2- Request Check code verify
         * @apiName checkVerificationCode
         * @apiGroup User
         *
         * @apiParam {string} phone Users.
         * @apiParam {string} code sms.
         * 
         *
         * @apiSuccess {Boolead} Success if Success then user is new , data equal to {isNewUser: true }, else {token: token, isNewUser: false} , else show error.
         */
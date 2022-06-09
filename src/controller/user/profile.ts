import express = require('express');
import { SuccessResponse } from '../../config';

export const getUserProfileController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        // @ts-expect-error
        const user = req.user;

        user.password = undefined;

        return SuccessResponse.send({ res, message: "Ok", data: user })

    }

    catch (err) {
        console.error(err)
        next(err)
    }

}
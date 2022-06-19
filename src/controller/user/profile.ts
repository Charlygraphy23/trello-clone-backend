import express = require('express');
import { validationResult } from 'express-validator';
import { SuccessResponse } from '../../config';
import { updateUserProfile } from '../../helper';

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


export const updateProfile = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { firstName, lastName, profileImage } = req.body

        // @ts-expect-error
        const user = req.user;

        await updateUserProfile({ firstName, lastName, profileImage, userId: user._id.toString() })
            .catch(err => { throw err });

        return SuccessResponse.send({ res, message: "Ok", data: user })

    }

    catch (err) {
        console.error(err)
        next(err)
    }

}
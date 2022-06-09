import express from 'express'
import { validationResult } from 'express-validator'
import { SuccessResponse } from '../../config'
import { createWorkspace } from '../../helper'

export const createWorkSpaceController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {


    const error = validationResult(req)

    try {

        if (!error.isEmpty()) throw { status: 400, message: "Validation Error", error };

        const { name, description } = req.body;

        // @ts-expect-error
        const user = req?.user;


        const data = await createWorkspace({ name, description, createdBy: user._id })

        return SuccessResponse.send({ res, message: "Created", status: 201, data: { _id: data._id } })


    }

    catch (err) {
        console.log(err)
        next(err)
    }

}
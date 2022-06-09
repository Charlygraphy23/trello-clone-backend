import express from 'express';
import { SuccessResponse } from '../../config';
import { generateHomeAggregateQuery } from '../../helper';
import { UserModelType, WorkSpaceModel } from '../../models';



export const homeController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {


    try {

        // @ts-expect-error
        const user: UserModelType = req?.user;

        const query = generateHomeAggregateQuery(user._id ?? "")

        const list = await WorkSpaceModel.aggregate(query).catch(err => {
            throw { status: 500, message: err.message, error: err }
        })

        return SuccessResponse.send({ res, message: "Ok", data: list })

    }

    catch (err) {
        console.error(err)
        next(err)
    }

}
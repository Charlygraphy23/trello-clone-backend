import express from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { MEMBER_ROLES, SuccessResponse } from '../../config';
import { addLabelWithBoardId, createBoard, createBoardMember, findBoardAndUpdate, findBoardById, findLabelByIdAndUpdate, getBoardDetails } from '../../helper';

export const createBoardController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const error = validationResult(req);

    const session = await mongoose.startSession();
    session.startTransaction()

    try {

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error: error }

        // @ts-expect-error
        const user = req.user

        const { workspace, name, backgroundColor, } = req.body;



        const [boardData] = await createBoard({ session, workspace, name, backgroundColor, createdBy: user._id })

        // @ts-expect-error
        await createBoardMember({ session, userId: user._id, role: MEMBER_ROLES.ADMIN, boardId: boardData?._id })

        await session.commitTransaction()
        session.endSession()


        return SuccessResponse.send({ res, message: "Ok", status: 201, data: { boardId: boardData._id } })


    }

    catch (err) {

        await session.abortTransaction();
        session.endSession()

        console.log(err)
        next(err)
    }


}


export const getBoardDataController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const { boardId } = req.body;


        if (!boardId) throw { status: 422, message: "Please provide a boardId!!" }


        const [data] = await getBoardDetails(boardId).catch(err => { throw { status: 500, message: err.message, error: err } })

        return SuccessResponse.send({ res, message: "Ok", data })

    }
    catch (err) {
        console.error(err)
        next(err)
    }

}

export const addLabelController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const error = validationResult(req);

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error: error }

        const { labelId, boardId, backgroundColor, name } = req.body;
        // @ts-expect-error
        const user = req.user


        const isValidBoard = await findBoardById(boardId).catch(err => { throw { status: 500, message: err.message, error: err } });

        if (!isValidBoard) throw { status: 400, message: "Board Id is not valid!!" }

        await addLabelWithBoardId({
            backgroundColor, boardId, name, userId: user._id.toString(), labelId
        }).catch(err => { throw { status: 500, message: err.message, error: err } });

        return SuccessResponse.send({ res, message: "Ok" })

    }
    catch (err) {
        console.error(err)
        next(err)
    }

}


export const updateLabelController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const error = validationResult(req);

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error: error }

        const { labelId, backgroundColor, name } = req.body;
        // @ts-expect-error
        const user = req.user


        await findLabelByIdAndUpdate({
            backgroundColor, name, userId: user._id.toString(), labelId
        }).catch(err => { throw { status: 500, message: err.message, error: err } });

        return SuccessResponse.send({ res, message: "Ok" })

    }
    catch (err) {
        console.error(err)
        next(err)
    }

}

export const updateBoardBackgroundController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {



        const { boardId, backgroundColor } = req.body;

        if (!boardId || !backgroundColor) throw { status: 422, message: "Invalid Input" }

        const data = { backgroundColor }
        await findBoardAndUpdate(boardId, data).catch(err => { throw { status: 500, message: err.message, error: err } });

        return SuccessResponse.send({ res, message: "Ok" })

    }
    catch (err) {
        console.error(err)
        next(err)
    }

}
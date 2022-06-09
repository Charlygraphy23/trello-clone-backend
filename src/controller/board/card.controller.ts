import express from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { CARD_TYPE, SuccessResponse } from '../../config';
import { addCheckList, addCheckListGroup, addList, addTask, checkListFindById, checkListFindByIdAndDelete, checkListGroupFindById, deleteCheckListGroup, findTaskById, getBoardInfoWithMemberId, labelFindById, taskFindById, taskUpdateById, updateCheckList, updateListPosition, updateTaskPosition, verifyBoardWithListId } from '../../helper';


export const addListController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {



    try {
        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { title, listId, boardId } = req.body;
        // @ts-expect-error
        const user = req.user

        const [boardInfo] = await getBoardInfoWithMemberId({ boardId, userId: user.id.toString() })

        if (!boardInfo) throw { status: 400, message: "No Board data found" }

        if (!boardInfo.member) throw { status: 400, message: "User don't have access to create" }



        // Create list

        await addList({ title, listId, boardId, userId: user.id.toString() })
            .catch(err => { throw err })



        return SuccessResponse.send({ status: 200, message: "Ok", res })


    }

    catch (err) {
        console.error(err)
        next(err)
    }

}

export const addTaskController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {



    try {
        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { content, listId, boardId, taskId } = req.body;
        // @ts-expect-error
        const user = req.user

        const [boardInfo] = await verifyBoardWithListId({ boardId, userId: user.id.toString(), listId })

        if (!boardInfo) throw { status: 400, message: "No Board data found" }
        if (!boardInfo.member) throw { status: 400, message: "User don't have access to create" }
        if (!boardInfo.list) throw { status: 400, message: `No List found with this id = ${listId}` }



        // Create Task

        await addTask({ content, listId, boardId, userId: user.id.toString(), taskId })
            .catch(err => { throw err })

        return SuccessResponse.send({ status: 200, message: "Ok", res })


    }

    catch (err) {
        console.error(err)
        next(err)
    }

}


export const updateTaskAndColumnsPositionController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {


    const session = await mongoose.startSession();


    try {

        await session.withTransaction(async () => {

            const error = validationResult(req)

            if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }


            const { type, source, destination, draggableId, boardId, listId } = req.body;


            if (type === CARD_TYPE.TASK) {
                await updateTaskPosition({ source, destination, session, taskId: draggableId, boardId, listId })
                    .catch(err => { throw { status: 500, message: err.message } })

            }

            if (type === CARD_TYPE.COLUMN) {
                await updateListPosition({ source, destination, session, draggableId, boardId, listId })
                    .catch(err => { throw { status: 500, message: err.message } })

            }

            await session.commitTransaction();
            return SuccessResponse.send({ res, message: "Ok" })

        })
            .catch(err => { throw err })




    }
    catch (err) {

        // await session.abortTransaction();

        console.error(err)
        next(err)
    }
    finally {
        session.endSession()

    }

}

export const addTaskInfoController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { taskId, data } = req.body;

        if (!taskId) throw { status: 422, message: "Please provide TaskId" }


        const isValidTask = await taskFindById(taskId);

        if (!isValidTask) throw { status: 400, message: "Task not valid !!" }


        await taskUpdateById({ taskId, data })


        return SuccessResponse.send({ status: 200, message: "Ok", res })

    }
    catch (err) {
        console.error(err)
        next(err)
    }


}

export const updateTaskLabelController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { taskId, labelId } = req.body;

        const [isValidTask, isValidLabel] = await Promise.all([
            taskFindById(taskId),
            labelFindById(labelId)
        ])

        if (!isValidTask || !isValidLabel) throw { status: 422, message: "Task or Label id not valid!!" }

        const labels = isValidTask?.labels ?? [];
        let updatedLabels = [];

        if (labels.find(labelID => labelID === labelId))
            updatedLabels = labels.filter(labelID => labelID !== labelId)

        else
            updatedLabels = [...labels, labelId]

        const data = {
            labels: updatedLabels
        }
        await taskUpdateById({ taskId, data })


        return SuccessResponse.send({ status: 200, message: "Ok", res })

    }
    catch (err) {
        console.error(err)
        next(err)
    }


}

export const updateCheckListController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { taskId, title, checkListId, isDone, checkListGroupId } = req.body;
        // @ts-expect-error
        const user = req.user

        const [isValidTask, hasCheckList, isValidCheckListGroup] = await Promise.all([
            findTaskById(taskId),
            checkListFindById(checkListId),
            checkListGroupFindById(checkListGroupId)
        ])

        if (!isValidCheckListGroup) throw { status: 422, message: "Checklist group id not valid!!" }

        if (!isValidTask) throw { status: 422, message: "Task id not valid!!" }

        if (hasCheckList) {
            await updateCheckList({ title, taskId, checkListId, userId: user._id.toString(), isDone, checkListGroupId })
        }
        else {
            await addCheckList({ title, taskId, checkListId, userId: user._id.toString(), isDone, checkListGroupId })
        }


        return SuccessResponse.send({ status: 200, message: "Ok", res })

    }
    catch (err) {
        console.error(err)
        next(err)
    }


}


export const addCheckListGroupController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { taskId, title, checkListGroupId } = req.body;
        // @ts-expect-error
        const user = req.user

        const isValidTask = await findTaskById(taskId)


        if (!isValidTask) throw { status: 422, message: "Task id not valid!!" }

        await addCheckListGroup({ taskId, title, checkListGroupId, userId: user._id.toString() })


        return SuccessResponse.send({ status: 200, message: "Ok", res })

    }
    catch (err) {
        console.error(err)
        next(err)
    }


}

export const deleteCheckListController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const { checkListId } = req.params;

        if (!checkListId) throw { status: 400, message: "Please provide checkListId" }


        await checkListFindByIdAndDelete(checkListId)

        return SuccessResponse.send({ status: 200, message: "Ok", res })

    }
    catch (err) {
        console.error(err)
        next(err)
    }


}

export const deleteCheckListGroupController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {


    const session = await mongoose.startSession();

    try {

        await session.withTransaction(async () => {


            const { checkListGroupId } = req.params;

            if (!checkListGroupId) throw { status: 400, message: "Please provide checkListGroupId" }


            await deleteCheckListGroup({ checkListGroupId, session })

            await session.commitTransaction();
            session.endSession()

            return SuccessResponse.send({ status: 200, message: "Ok", res })


        })

    }
    catch (err) {


        await session.abortTransaction()
        session.endSession()

        console.error(err)
        next(err)
    }


}
import mongoose, { PipelineStage } from "mongoose";
import { convertObjectId } from "../config";
import { BoardModel, CheckListGroupModel, CheckListModel, LabelModel, ListModel, TaskMemberModel, TaskModel } from "../models";
import { TaskCommentsModel } from "../models/board/taskComment.model";

type AddListType = {
    title: string,
    listId: string,
    boardId: string,
    userId: string
}

type AddTaskType = {
    content: string,
    listId: string,
    boardId: string,
    userId: string,
    taskId: string
}

type UpdateTaskPositionType = {
    session: mongoose.ClientSession,
    source: {
        droppableId: string,
        index: number
    },
    destination: {
        droppableId: string,
        index: number
    },
    taskId: string,
    listId: string,
    boardId: string
}

interface RearrangeTaskType extends UpdateTaskPositionType {
    isDestinationColumn: boolean,

}

type AddCheckListType = {
    taskId: string,
    checkListId: string,
    userId: string,
    title: string,
    checkListGroupId: string,
    isDone: boolean,
}

type AddCheckListGroupType = {
    taskId: string,
    checkListGroupId: string,
    userId: string,
    title: string
}

type AddTaskModelCommentType = {
    userId: string,
    message: string,
    taskId: string,
    commentId: string,
}

const getBoardQuery = ({ boardId, userId }: { boardId: string, userId: string }): PipelineStage[] => {

    return [
        {
            $match: {
                $expr: { $eq: ["$_id", convertObjectId(boardId)] }
            }
        },

        {
            $lookup: {
                from: 'members',
                let: { boardId: "$_id", memberId: convertObjectId(userId) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$boardId", "$$boardId"] },
                                    { $eq: ["$memberId", "$$memberId"] }
                                ]
                            }
                        }
                    }

                ],
                as: 'member'
            }
        },
        { $unwind: '$member' }
    ]

}

const getQueryToVerifyTask = ({ boardId, userId, listId }: { boardId: string, userId: string, listId: string }): PipelineStage[] => {


    return [
        ...getBoardQuery({ boardId, userId }),

        {
            $lookup: {
                from: 'lists',
                let: { boardId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$boardId", "$$boardId"] },
                                    { $eq: ["$listId", listId] }
                                ]
                            }
                        }
                    }

                ],
                as: 'list'
            }
        },
        { $unwind: '$list' },

    ]
}

export const getBoardInfoWithMemberId = async ({ boardId, userId }: { boardId: string, userId: string }) => {
    return await BoardModel.aggregate(getBoardQuery({ boardId, userId }))

}

export const findListByListId = async (listId: string) => {
    return ListModel.findOne({ listId: listId })
}

export const addList = async ({ title, listId, boardId, userId }: AddListType) => {
    const listFound = await findListByListId(listId)

    if (listFound) throw { status: 500, message: `Already added to List by this - ${listId} id` }

    const order = await getOrderOfList()
    return await ListModel.create({ title, listId, boardId, createdBy: userId, order })
}

export const verifyBoardWithListId = async ({ boardId, userId, listId }: { boardId: string, userId: string, listId: string }) => {
    return await BoardModel.aggregate(getQueryToVerifyTask({ boardId, userId, listId }))
}

export const findTaskById = async (taskId: string) => {
    return TaskModel.findOne({ taskId: taskId })
}

export const addTask = async ({ content, boardId, listId, taskId, userId }: AddTaskType) => {
    const taskFound = await findTaskById(taskId)

    if (taskFound) throw { status: 500, message: `Already added to Task by this - ${taskId} id` }

    const order = await getOrderOfTask(listId)

    return await TaskModel.create({ content, boardId, listId, createdBy: convertObjectId(userId), taskId, order })
}

export const getOrderOfList = async () => {


    const [lastListOrder]: any = await ListModel.find().sort({ order: -1 }).limit(1);

    if (!lastListOrder) return 0


    const newListOrder: number = lastListOrder.order + 1;

    return newListOrder


}

export const getOrderOfTask = async (listId: string) => {


    const [lastTaskOrder]: any = await TaskModel.find({ listId }).sort({ order: -1 }).limit(1);

    if (!lastTaskOrder) return 0


    const newListOrder: number = lastTaskOrder.order + 1;

    return newListOrder


}

const rearrangeTasksByOrder = async ({ isDestinationColumn, session, boardId, listId, taskId, destination }: RearrangeTaskType) => {
    const allTasks = await TaskModel.find({ boardId, listId })
        .catch(err => { throw err })

    const sortedTasks = allTasks.sort((a, b) => {
        if (a.order > b.order) return 1;
        else return -1
    })

    // update selected task order 
    if (isDestinationColumn) {
        await TaskModel.findOneAndUpdate({ taskId }, { order: destination.index, listId }, { session })
            .catch(err => { throw err })
    }

    let order = 0;

    for (let task of sortedTasks) {

        // skipping already used index
        if (order === destination.index && isDestinationColumn) order++;


        if (taskId !== task.taskId) {
            await TaskModel.findByIdAndUpdate({ _id: task._id }, {
                order: order++,
            }, { session }).catch(err => { throw err })
        }
    }
}


export const updateTaskPosition = async ({ source, destination, session, taskId, boardId, listId }: UpdateTaskPositionType) => {

    if (source.droppableId === destination.droppableId) {
        await rearrangeTasksByOrder({ destination, session, taskId, boardId, listId, isDestinationColumn: true, source })
    }
    else {

        await Promise.all([
            // re arrange destination column tasks
            rearrangeTasksByOrder({ destination, session, taskId, boardId, listId: destination.droppableId, isDestinationColumn: true, source }),
            // re arrange source column tasks
            rearrangeTasksByOrder({ destination, session, taskId, boardId, listId: source.droppableId, isDestinationColumn: false, source })
        ]).catch(err => { throw err })
    }
}

export const updateListPosition = async ({ destination, session, boardId, listId }: { listId: string, source: any, destination: any, draggableId: string, boardId: string, session: mongoose.ClientSession }) => {

    const [allColumns] = await Promise.all([
        ListModel.find({ boardId }),

        // update selected column
        ListModel.findOneAndUpdate({ listId }, { order: destination.index, listId }, { session })
            .catch(err => { throw err })

    ]).catch(err => { throw err });

    const sortedColumns = allColumns.sort((a, b) => {
        if (a.order > b.order) return 1;
        else return -1
    })

    let order = 0;

    for (let column of sortedColumns) {

        // skipping already used index
        if (order === destination.index) order++;


        if (listId !== column.listId) {
            await ListModel.findByIdAndUpdate({ _id: column._id }, {
                order: order++,
            }, { session }).catch(err => { throw err })
        }
    }

}

export const taskFindById = async (taskId: string) => {

    return TaskModel.findOne({ taskId })
        .catch(err => { throw err })
}

export const labelFindById = async (labelId: string) => {

    return LabelModel.findOne({ labelId })
        .catch(err => { throw err })
}


export const taskUpdateById = async ({ taskId, data }: { taskId: string, data: any }) => {
    return TaskModel.findOneAndUpdate({ taskId }, { ...data }).catch(err => { throw err })
}

export const checkListFindById = async (checkListId: string) => {
    return CheckListModel.findOne({ checkListId }).catch(err => { throw err })
}


export const checkListGroupFindById = async (checkListGroupId: string) => {
    return CheckListGroupModel.findOne({ checkListGroupId }).catch(err => { throw err })
}

export const checkListWithCheckListGroup = async ({ checkListId, checkListGroupId }: { checkListGroupId: string, checkListId: string }) => {
    return CheckListModel.findOne({ checkListGroupId, checkListId }).catch(err => { throw err })
}


export const updateCheckList = async ({ taskId, checkListId, userId, title, isDone, checkListGroupId }: AddCheckListType) => {

    if (!mongoose.Types.ObjectId.isValid(userId)) throw { status: 500, message: "No valid user id" }
    if (!checkListGroupId) throw { status: 500, message: "No valid checkListGroupId" }
    const createdBy = new mongoose.Types.ObjectId(userId)

    return await CheckListModel.findOneAndUpdate({ checkListId }, { $set: { taskId, createdBy, title, isDone } }).catch(err => { throw err })
}

export const addCheckList = async ({ taskId, checkListId, userId, title, isDone, checkListGroupId }: AddCheckListType) => {


    if (!mongoose.Types.ObjectId.isValid(userId)) throw { status: 500, message: "No valid user id" }
    if (!checkListGroupId) throw { status: 500, message: "No valid checkListGroupId" }

    const createdBy = new mongoose.Types.ObjectId(userId)

    return await CheckListModel.create({ checkListId, taskId, createdBy, title, isDone, checkListGroupId }).catch(err => { throw err })
}

export const addCheckListGroup = async ({ taskId, userId, title, checkListGroupId }: AddCheckListGroupType) => {


    if (!mongoose.Types.ObjectId.isValid(userId)) throw { status: 500, message: "No valid user id" }
    if (!checkListGroupId) throw { status: 500, message: "No valid checkListGroupId" }

    const createdBy = new mongoose.Types.ObjectId(userId)

    return await CheckListGroupModel.create({ checkListGroupId, taskId, createdBy, title }).catch(err => { throw err })
}

export const checkListFindByIdAndDelete = async (checkListId: string) => {

    if (!checkListId) throw { status: 500, message: "Not a valid checkListId" }

    return CheckListModel.findOneAndDelete({ checkListId }).catch(err => { throw err })

}

export const deleteCheckListGroup = async ({ checkListGroupId, session }: { checkListGroupId: string, session: mongoose.ClientSession }) => {

    if (!checkListGroupId) throw { status: 500, message: "Not a valid checkListId" }


    await Promise.all([
        CheckListGroupModel.findOneAndDelete({ checkListGroupId }, { session }),
        CheckListModel.deleteMany({ checkListGroupId }, { session })
    ]).catch(err => { throw err })

}

export const getMemberListOfTask = async (taskId: string) => {
    return await TaskMemberModel.find({ taskId })
        .catch(err => { throw err })
}

export const removeMemberFormTask = async ({ userId, taskId }: { userId: string, taskId: string }) => {
    return await TaskMemberModel.findOneAndDelete({ taskId, userId })
        .catch(err => { throw err })
}

export const addMemberFormTask = async ({ userId, taskId }: { userId: string, taskId: string }) => {
    return await TaskMemberModel.create({ taskId, userId })
        .catch(err => { throw err })
}


export const addCommentToTask = async ({ userId, taskId, message, commentId }: AddTaskModelCommentType) => {
    return TaskCommentsModel.create({
        userId,
        taskId, message, commentId
    })
        .catch(err => { throw err })
}

export const getAllMessagesOfTask = async (taskId: string) => {
    return TaskCommentsModel.aggregate([

        {
            $match: { $expr: { $eq: ["$taskId", taskId] } }
        },

        {
            $lookup: {
                from: 'users',
                let: { userId: "$userId" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", '$$userId'] } } },

                    { $project: { __v: 0, updatedAt: 0 } }
                ],
                as: 'user'
            }
        },

        { $unwind: "$user" },
        { $project: { __v: 0, updatedAt: 0 } }


    ])
        .catch(err => { throw err })
}

export const deleteComment = async (comment: string) => {
    return TaskCommentsModel.findOneAndDelete({ commentId: comment })
        .catch(err => { throw err })
}

export const getAllTask = () => {
    return TaskModel.find()
}

export const deleteTaskDependencies = async ({ taskId, session }: { taskId: string, session: mongoose.ClientSession }) => {
    return Promise.all([
        CheckListModel.deleteMany({ taskId }, { session }),
        CheckListGroupModel.deleteMany({ taskId }, { session }),
        TaskCommentsModel.deleteMany({ taskId }, { session }),
        TaskCommentsModel.deleteMany({ taskId }, { session }),
        TaskMemberModel.deleteMany({ taskId }, { session }),
    ]).catch(err => { throw err })
}

export const deleteTaskById = async ({ session, taskId, listId }: { session: mongoose.ClientSession, taskId: string, listId: string }) => {
    const allTasks = await TaskModel.find({ listId })
        .catch(err => { throw err })


    const filterTaskById = allTasks.filter(task => task.taskId !== taskId)

    const sortedTasks = filterTaskById.sort((a, b) => {
        if (a.order > b.order) return 1;
        else return -1
    })

    // delete existing task
    await TaskModel.findOneAndDelete({ taskId }, { session })
    await deleteTaskDependencies({ session, taskId })

    let order = 0;

    for (let task of sortedTasks) {
        if (taskId !== task.taskId) {
            await TaskModel.findByIdAndUpdate({ _id: task._id }, {
                order: order++,
            }, { session }).catch(err => { throw err })
        }
    }
}
export const deleteColumnById = async ({ session, boardId, listId }: { session: mongoose.ClientSession, boardId: string, listId: string }) => {

    await ListModel.findOneAndDelete({ listId, boardId }, { session });

    const tasks = await TaskModel.find({ listId })

    await TaskModel.deleteMany({ listId }, { session, })
    for (const task of tasks) {
        await deleteTaskDependencies({ session, taskId: task.taskId }).catch(err => { throw err })
    }

}
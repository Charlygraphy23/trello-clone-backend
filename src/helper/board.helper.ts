import mongoose, { PipelineStage } from "mongoose";
import { convertObjectId, MEMBER_ROLES } from "../config";
import { BoardModel, BoardModelType, LabelModel, MemberModel } from "../models";



interface CreateBoardType extends BoardModelType {
    session: mongoose.ClientSession
}

type CreateBoardMemberType = {
    session: mongoose.ClientSession,
    userId: string,
    role: MEMBER_ROLES,
    boardId: string,
    workspace: string
}

type AddLabelType = {
    backgroundColor: string,
    userId: string,
    boardId?: string,
    name: string
    labelId: string
}

export const createBoard = async ({ name, backgroundColor, workspace, createdBy, session }: CreateBoardType) => {

    if (!workspace) throw { status: 500, message: "Please specify a workspace" }
    if (!createdBy) throw { status: 500, message: "Please specify a createdBy" }

    return await BoardModel.create([{
        name, backgroundColor, workspace: convertObjectId(workspace.toString()), createdBy: convertObjectId(createdBy.toString()),
    }], { session })
        .catch(err => {
            throw { status: 500, message: err.message, error: err }
        })

}

export const createBoardMember = async ({ session, userId, role, boardId, workspace }: CreateBoardMemberType) => {

    return await MemberModel.create([{
        memberId: convertObjectId(userId),
        role: role,
        boardId: convertObjectId(boardId),
        workspace: convertObjectId(workspace)
    }], { session })
        .catch(err => {
            throw { status: 500, message: err.message, error: err }
        })

}

const getBoardDetailsQuery = (boardId: string): PipelineStage[] => {

    return [
        { $match: { $expr: { $eq: ['$_id', convertObjectId(boardId)] } } },

        {
            $lookup: {
                from: 'users',
                let: { memberId: "$createdBy" },
                pipeline: [

                    { $match: { $expr: { $eq: ['$_id', "$$memberId"] } } },

                    { $project: { __v: 0, updatedAt: 0, password: 0 } }

                ],
                as: "boardOwner"
            }
        },
        {
            $unwind: {
                path: "$boardOwner",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $lookup: {
                from: 'members',
                let: { boardId: convertObjectId(boardId) },
                pipeline: [

                    { $match: { $expr: { $eq: ['$boardId', "$$boardId"] } } },


                    {
                        $lookup: {
                            from: 'users',
                            let: { memberId: "$memberId" },
                            pipeline: [

                                { $match: { $expr: { $eq: ['$_id', "$$memberId"] } } },

                                { $project: { __v: 0, updatedAt: 0, password: 0 } }
                            ],
                            as: "user"
                        }
                    },
                    {
                        $unwind: {
                            path: "$user",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $project: { __v: 0, updatedAt: 0, createdAt: 0 } }
                ],
                as: "members"
            }
        },

        {
            $lookup: {
                from: 'lists',
                let: { boardId: convertObjectId(boardId) },
                pipeline: [

                    { $match: { $expr: { $eq: ['$boardId', "$$boardId"] } } },

                    { $project: { __v: 0, updatedAt: 0 } },

                    {
                        $lookup: {
                            from: 'tasks',
                            let: { boardId: "$$boardId", listId: "$listId" },
                            pipeline: [

                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ['$boardId', "$$boardId"] },
                                                { $eq: ['$listId', "$$listId"] }
                                            ]
                                        }
                                    }
                                },

                                { $sort: { order: 1 } },




                                {
                                    $group: {
                                        _id: 0,
                                        ids: { $push: "$taskId" }
                                    }
                                },

                                { $project: { ids: 1 } },

                            ],
                            as: "taskIds"
                        }
                    },

                    {
                        $unwind: {
                            path: "$taskIds",
                            preserveNullAndEmptyArrays: true
                        }
                    },

                    {
                        $addFields: {
                            taskIds: '$taskIds.ids'
                        }
                    },

                ],
                as: "columns"
            }
        },

        {
            $lookup: {
                from: 'tasks',
                let: { boardId: convertObjectId(boardId) },
                pipeline: [

                    { $match: { $expr: { $eq: ['$boardId', "$$boardId"] } } },

                    {
                        $lookup: {
                            from: 'check_list_groups',
                            let: { taskId: "$taskId" },
                            pipeline: [

                                { $match: { $expr: { $eq: ['$taskId', "$$taskId"] } } },


                                {
                                    $lookup: {
                                        from: 'check_lists',
                                        let: { taskId: "$taskId", groupId: "$checkListGroupId" },
                                        pipeline: [

                                            {
                                                $match: {
                                                    $expr: {
                                                        $and: [
                                                            { $eq: ['$taskId', "$$taskId"] },
                                                            { $eq: ['$checkListGroupId', "$$groupId"] }
                                                        ]
                                                    }
                                                }
                                            },

                                            { $project: { __v: 0, updatedAt: 0 } },

                                        ],
                                        as: "checkLists"
                                    }
                                },

                                { $project: { __v: 0, updatedAt: 0 } },

                            ],
                            as: "checkListGroups"
                        }
                    },


                    {
                        $lookup: {
                            from: 'task_members',
                            let: { taskId: "$taskId" },
                            pipeline: [

                                {
                                    $match: {
                                        $expr: { $eq: ['$taskId', "$$taskId"] }
                                    }
                                },

                                {
                                    $lookup: {
                                        from: 'users',
                                        let: { userId: "$userId" },
                                        pipeline: [

                                            {
                                                $match: {
                                                    $expr: { $eq: ['$_id', "$$userId"] }
                                                }
                                            },

                                            { $project: { _id: 1, firstName: 1, lastName: 1, profileImage: 1 } },

                                        ],
                                        as: "user"
                                    }
                                },

                                { $unwind: "$user" },

                                { $replaceRoot: { newRoot: "$user" } },

                                { $project: { __v: 0, updatedAt: 0 } },

                            ],
                            as: "members"
                        }
                    },

                    {
                        $lookup: {
                            from: 'task_comments',
                            let: { taskId: "$taskId" },
                            pipeline: [

                                { $match: { $expr: { $eq: ['$taskId', "$$taskId"] } } },

                            ],
                            as: "checkListGroups"
                        }
                    },

                    {
                        $addFields: {
                            taskCommentCount: {
                                $reduce: {
                                    input: "$checkListGroups",
                                    initialValue: 0,
                                    in: {
                                        $add: ['$$value', 1]
                                    }
                                }
                            }
                        }
                    },


                    { $project: { __v: 0, updatedAt: 0, checkListGroups: 0 } },

                ],
                as: "tasks"
            }
        },

        {
            $lookup: {
                from: 'lists',
                let: { boardId: convertObjectId(boardId) },
                pipeline: [

                    { $match: { $expr: { $eq: ['$boardId', "$$boardId"] } } },
                    { $sort: { order: 1 } },


                    {
                        $group: {
                            _id: 0,
                            ids: { $push: "$listId" }
                        }
                    }

                ],
                as: "columnOrder"
            }
        },


        {
            $unwind: {
                path: "$columnOrder",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $addFields: {
                columnOrder: "$columnOrder.ids"
            }
        },

        {
            $lookup: {
                from: 'labels',
                let: { boardId: convertObjectId(boardId) },
                pipeline: [

                    { $match: { $expr: { $eq: ['$boardId', "$$boardId"] } } },


                    { $project: { __v: 0, updatedAt: 0, createdAt: 0 } }
                ],
                as: "labels"
            }
        },

        {
            $project: {
                "name": 1,
                "backgroundColor": 1,
                "createdBy": 1,
                "workspace": 1,
                "createdAt": 1,
                "members": 1,
                "boardOwner": 1,
                "columnOrder": 1,
                "labels": 1,
                "columns": {
                    "$arrayToObject": {
                        "$map": {
                            "input": "$columns",
                            "as": "el",
                            "in": {
                                "k": "$$el.listId",
                                "v": "$$el"
                            }
                        }
                    }
                },
                "tasks": {
                    "$arrayToObject": {
                        "$map": {
                            "input": "$tasks",
                            "as": "el",
                            "in": {
                                "k": "$$el.taskId",
                                "v": "$$el"
                            }
                        }
                    }
                }
            }
        },



        { $project: { __v: 0, createdAt: 0 } }
    ]

}

export const getBoardDetails = async (boardId: string) => {
    return BoardModel.aggregate(getBoardDetailsQuery(boardId))
}

export const findBoardById = async (boardId: string) => {
    return BoardModel.findById({ _id: convertObjectId(boardId) })
        .catch(err => { throw err })
}
export const findBoardAndUpdate = async (boardId: string, data: any) => {
    return BoardModel.findByIdAndUpdate({ _id: convertObjectId(boardId) }, { ...data })
        .catch(err => { throw err })
}

export const findLabelByIdAndUpdate = async ({
    labelId, backgroundColor, name
}: AddLabelType) => {
    return LabelModel.findOneAndUpdate({
        labelId
    }, { backgroundColor, name })
        .catch(err => { throw err })
}

export const addLabelWithBoardId = async ({
    boardId, userId, name, backgroundColor, labelId
}: AddLabelType) => {
    return LabelModel.create({
        boardId, createdBy: convertObjectId(userId), name, backgroundColor, labelId
    })
        .catch(err => { throw err })
}

import mongoose, { PipelineStage } from "mongoose"
import { convertObjectId } from "../config"

export const generateHomeAggregateQuery = (userId: (mongoose.Types.ObjectId | string)): PipelineStage[] => {

    return [
        {
            $lookup: {
                from: "members",
                let: { userId: userId, workspace: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$memberId", "$$userId"] },
                                    { $eq: ["$workspace", "$$workspace"] }
                                ]
                            }
                        }
                    },
                    { $limit: 1 }
                ],
                as: 'user'
            }
        },
        // 👆 that means user belongs to this workspace

        {
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $match: {
                $expr: {
                    $or: [
                        { $eq: ["$createdBy", "$user.memberId"] },
                        { $eq: ["$_id", "$user.workspace"] },
                        { $eq: ["$createdBy", convertObjectId(String(userId))] },
                    ]
                }
            }
        },

        // 👆 adding filter to check if the user belongs to this workspace again 🔁

        // 👇 getting list of boards of the specific workspace

        {
            $lookup: {
                from: "boards",
                let: { workspaceId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$workspace", "$$workspaceId"] },

                                ]
                            }
                        }
                    },


                    // 👇 find if the user has access to the board
                    {
                        $lookup: {
                            from: "members",
                            let: { userId: userId, boardId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$memberId", "$$userId"] },
                                                { $eq: ["$boardId", "$$boardId"] }
                                            ]
                                        }
                                    }
                                },
                                { $limit: 1 }
                            ],
                            as: 'hasAccessToTheBoard'
                        }
                    },

                    { $unwind: "$hasAccessToTheBoard" },
                    { $project: { hasAccessToTheBoard: 0 } }

                ],
                as: 'boards'
            }
        },
        // { $project: { user: 0 } }
    ]

}
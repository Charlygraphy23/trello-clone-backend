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
                    }
                ],
                as: 'user'
            }
        },

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
        {
            $lookup: {
                from: "boards",
                let: { workspaceId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$workspace", "$$workspaceId"] } } }
                ],
                as: 'boards'
            }
        },
        { $project: { user: 0 } }
    ]

}
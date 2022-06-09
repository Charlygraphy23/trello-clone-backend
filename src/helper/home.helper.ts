import mongoose, { PipelineStage } from "mongoose"

export const generateHomeAggregateQuery = (userId: (mongoose.Types.ObjectId | string)): PipelineStage[] => {


    return [
        { $match: { $expr: { $eq: ["$createdBy", userId] } } },
        {
            $lookup: {
                from: "boards",
                let: { workspaceId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$workspace", "$$workspaceId"] } } }
                ],
                as: 'boards'
            }
        }
    ]

}
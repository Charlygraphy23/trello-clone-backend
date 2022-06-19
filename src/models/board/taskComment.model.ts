import mongoose from 'mongoose';

export interface TaskCommentModelType {
    _id?: mongoose.Schema.Types.ObjectId;
    userId?: mongoose.Schema.Types.ObjectId;
    taskId: string,
    message?: string,
    time?: number
    commentId?: number
}

const schema = new mongoose.Schema<TaskCommentModelType>(
    {

        taskId: {
            type: String,
            default: ''
        },
        commentId: {
            type: String,
            default: '', unique: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            default: '',
            ref: 'users'
        },
        message: String,
        time: {
            type: Number,
            default: Date.now()
        }

    },
    { timestamps: true }
);

schema.index({ userId: 1, taskId: 1 })


export const TaskCommentsModel = mongoose.model('task_comments', schema);

import mongoose from 'mongoose';

export interface TaskMemberModelType {
    _id?: mongoose.Schema.Types.ObjectId;
    userId?: mongoose.Schema.Types.ObjectId;
    taskId: string
}

const schema = new mongoose.Schema<TaskMemberModelType>(
    {

        taskId: {
            type: String,
            default: ''
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            default: '',
            ref: 'users'
        }

    },
    { timestamps: true }
);

schema.index({ userId: 1, taskId: 1 })


export const TaskMemberModel = mongoose.model('task_members', schema);

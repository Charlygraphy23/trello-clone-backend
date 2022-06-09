import mongoose from 'mongoose';

export interface TaskModelType {
    _id?: mongoose.Schema.Types.ObjectId;
    content?: string;
    createdBy?: mongoose.Types.ObjectId,
    boardId?: mongoose.Types.ObjectId,
    listId: string
    taskId: string,
    order: number,
    description: string,
    labels?: string[]
}

const schema = new mongoose.Schema<TaskModelType>(
    {

        taskId: {
            type: String,
            default: '',
            unique: true
        },
        content: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        listId: {
            type: String,
            default: '',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            default: '',
            ref: 'users'
        },

        boardId: {
            type: mongoose.Schema.Types.ObjectId,
            default: '',
            ref: 'boards'
        },
        order: {
            type: Number,
            default: 0
        },
        labels: {
            type: Array,
            of: String,
        }

    },
    { timestamps: true }
);

schema.index({ createdBy: 1, boardId: 1, listId: 1, taskId: 1 })


export const TaskModel = mongoose.model('tasks', schema);

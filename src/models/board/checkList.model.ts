import mongoose from 'mongoose';

export interface CheckListModelType {
    _id?: mongoose.Schema.Types.ObjectId;
    title?: string;
    isDone?: boolean;
    checkListId?: string;
    createdBy?: mongoose.Types.ObjectId,
    taskId?: string,
    checkListGroupId?: string,
}

const schema = new mongoose.Schema<CheckListModelType>(
    {
        title: {
            type: String,
            default: '',
        },
        checkListId: {
            type: String,
            default: '',
            unique: true
        },
        checkListGroupId: {
            type: String,
            default: '',
        },
        isDone: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            default: '',
            ref: 'users'
        },

        taskId: {
            type: String,
            default: '',

        },

    },
    { timestamps: true }
);

schema.index({ createdBy: 1, taskId: 1, checkListId: 1 })


export const CheckListModel = mongoose.model('check_lists', schema);

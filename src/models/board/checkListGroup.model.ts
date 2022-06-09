import mongoose from 'mongoose';

export interface CheckListGroupModelType {
    _id?: mongoose.Schema.Types.ObjectId;
    checkListGroupId?: string,
    taskId?: string,
    createdBy?: string
    title?: string
}

const schema = new mongoose.Schema<CheckListGroupModelType>(
    {
        checkListGroupId: {
            type: String,
            default: '',
            unique: true

        },
        taskId: {
            type: String,
            default: ''
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        title: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

schema.index({ createdBy: 1, taskId: 1, checkListGroupId: 1 })


export const CheckListGroupModel = mongoose.model('check_list_groups', schema);

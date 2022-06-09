import mongoose from 'mongoose';

export interface LabelModelType {
    _id?: mongoose.Schema.Types.ObjectId;
    name?: string;
    labelId?: string;
    backgroundColor?: string;
    createdBy?: mongoose.Types.ObjectId,
    boardId?: mongoose.Types.ObjectId,

}

const schema = new mongoose.Schema<LabelModelType>(
    {
        labelId: {
            type: String,
            default: '',
            unique: true
        },
        name: {
            type: String,
            default: '',
        },
        backgroundColor: {
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

    },
    { timestamps: true }
);

schema.index({ createdBy: 1, boardId: 1 })


export const LabelModel = mongoose.model('labels', schema);

import mongoose from 'mongoose';

export interface BoardModelType {
    _id?: mongoose.Schema.Types.ObjectId;
    name?: string;
    backgroundColor?: string;
    createdBy?: mongoose.Types.ObjectId,
    workspace?: mongoose.Types.ObjectId
}

const schema = new mongoose.Schema<BoardModelType>(
    {
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

        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            default: '',
            ref: 'workspaces'
        },

    },
    { timestamps: true }
);

schema.index({ createdBy: 1, workspace: 1 })


export const BoardModel = mongoose.model('boards', schema);

import mongoose from 'mongoose';

export interface UserModelType {
    _id?: mongoose.Types.ObjectId,
    email?: string;
    accepted?: boolean,
    boardId?: mongoose.Types.ObjectId

}

const schema = new mongoose.Schema<UserModelType>(
    {

        email: {
            type: String,
            default: '',
            lowercase: true,
            trim: true,
            unique: true,
        },

        accepted: {
            type: Boolean,
            default: false,
        },

        boardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'boards',
        },

    },
    { timestamps: true }
);

schema.index({ email: 1, boardId: 1 })

export const InviteModel = mongoose.model('invites', schema);

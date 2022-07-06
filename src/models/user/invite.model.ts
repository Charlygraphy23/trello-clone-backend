import mongoose from 'mongoose';

export interface InviteModelType {
    _id?: mongoose.Types.ObjectId,
    email?: string;
    accepted?: boolean,
    boardId?: mongoose.Types.ObjectId

}

const schema = new mongoose.Schema<InviteModelType>(
    {

        email: {
            type: String,
            default: '',
            lowercase: true,
            trim: true,
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

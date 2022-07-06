import mongoose from 'mongoose';
import { MEMBER_ROLES } from '../../config';

export interface MemberModelType {
    _id?: mongoose.Schema.Types.ObjectId;
    memberId?: mongoose.Schema.Types.ObjectId,
    role?: MEMBER_ROLES,
    boardId?: mongoose.Schema.Types.ObjectId,
    workspace?: mongoose.Schema.Types.ObjectId
}

const schema = new mongoose.Schema<MemberModelType>(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            default: '',
            ref: 'users'
        },

        role: {
            type: String,
            upperCase: true,
            default: '',
            enum: MEMBER_ROLES
        },

        boardId: {
            type: mongoose.Schema.Types.ObjectId,
            default: '',
            ref: 'boards'
        },

        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            default: '',
            ref: 'workspaces'
        }

    },
    { timestamps: true }
);

schema.index({ workspace: 1, boardId: 1 })


export const MemberModel = mongoose.model('members', schema);

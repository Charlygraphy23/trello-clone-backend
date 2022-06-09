import mongoose from 'mongoose';

export interface ListModelType {
    _id?: mongoose.Schema.Types.ObjectId;
    title?: string;
    createdBy?: mongoose.Types.ObjectId,
    boardId?: mongoose.Types.ObjectId,
    listId: string,
    taskIds?: string[],
    order: number
}

const schema = new mongoose.Schema<ListModelType>(
    {
        title: {
            type: String,
            default: '',
        },
        listId: {
            type: String,
            default: '',
            unique: true
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
        }


    },
    { timestamps: true }
);

schema.index({ createdBy: 1, boardId: 1, listId: 1 })


export const ListModel = mongoose.model('lists', schema);

import mongoose from 'mongoose';

export interface InviteModelType {
    _id?: mongoose.Types.ObjectId,
    email?: string;
    expires?: string,
    otp?: number

}

const schema = new mongoose.Schema<InviteModelType>(
    {

        email: {
            type: String,
            default: '',
            lowercase: true,
            trim: true,
        },

        expires: {
            type: String,
            default: "",
        },

        otp: {
            type: Number,

        },

    },
    { timestamps: true }
);

schema.index({ email: 1 })

export const OtpModel = mongoose.model('otps', schema);

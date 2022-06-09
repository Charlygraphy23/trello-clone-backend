import mongoose from 'mongoose';
import { LoginType } from '../../config';

export interface UserModelType {
  _id?: mongoose.Types.ObjectId,
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  loginType?: LoginType;
  profileImage?: string;
  isRegistered?: false;
  googleId?: string;
}

const userSchema = new mongoose.Schema<UserModelType>(
  {
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      default: '',
    },
    loginType: {
      type: String,
      enum: LoginType,
      default: LoginType.password,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, googleId: 1 })

export const UserModel = mongoose.model('users', userSchema);

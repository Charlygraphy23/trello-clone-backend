import express from 'express';
import { Result, ValidationError } from 'express-validator';
import mongoose from 'mongoose';



declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FRONT_END_URL: string;
      JWT_KEY: string;
      MONGO_URL: string;
      SENDINBLUE_API_KEY: string;
      SENDER_EMAIL: string;
      APP_NAME: string;
      GOOGLE_CLIENT_ID: string
    }
  }
}


type ErrorSchema = {
  status: number;
  message?: string;
  error?: Result<ValidationError> | any;
  res: express.Response;
};

type SuccessResponseType = {
  status?: number;
  message?: string;
  res: express.Response;
  data?: any;
};

// Error
class ServerError {
  public static throw({ status, message, error, res }: ErrorSchema) {
    return res.status(status).json({
      status,
      msg: message,
      error,
    });
  }

  public static message({ status, message, res }: ErrorSchema) {
    return res.status(status).json({
      status,
      msg: message,
    });
  }
}

export const TOKEN_EXP = {
  access_token: '20s',
  refresh_token: '10m'
}

export class SuccessResponse {
  public static send({
    res,
    message = 'Ok',
    status = 200,
    data,
  }: SuccessResponseType) {
    return res.status(status).json({
      status,
      msg: message,
      data,
    });
  }


  public static sendWithCookie({
    res,
    message = 'Ok',
    status = 200,
    data,
  }: SuccessResponseType) {
    data.auth = true
    res.cookie("access_token", data?.accessToken, COOKIE_OPTIONS)
    return res.cookie('refresh_token', data.refreshToken, COOKIE_OPTIONS).status(status).json({
      status,
      msg: message,
      data,
    });
  }
}

export const errorHandler = (
  err: Result<ValidationError> | any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!err) return next();

  const errorData = {
    status: err.status ?? 500,
    message: err.message ?? 'Internal Error',
    res,
    error: err?.error ?? undefined,
  };
  ServerError.throw(errorData);
};

export enum LoginType {
  google = 'google',
  password = 'password',
}

export const connectToDB = async () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to database'))
    .catch((err) => console.error(err));
};

export const convertObjectId = (id: string) => {
  return new mongoose.Types.ObjectId(id)
}


export const COOKIE_OPTIONS = {
  httpOnly: true
}

export enum MEMBER_ROLES {
  ADMIN = 'ADMIN'
}

export enum CARD_TYPE {
  TASK = 'task',
  COLUMN = "column"
}

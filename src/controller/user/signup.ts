import express = require('express');
import { Result, ValidationError, validationResult } from 'express-validator';
import { sendEmail } from '../../config';
import { COOKIE_OPTIONS, LoginType, SuccessResponse, TOKEN_EXP } from '../../config/app.config';
import {
  checkEmail,
  checkUserWithGoogleId,
  comparePassword,
  findUserById,
  generateJwtToken,
  generatePasswordHash,
  generateSignUpEmail,
  getHTMLForSignupEmail,
  googleAuthInfo,
  jwtVerify,
  refetchToken,
  validateJWTTokenForSignUp
} from '../../helper';
import { UserModel } from '../../models';

export const GenerateLinkWithEmailController = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const error: Result<ValidationError> = validationResult(req);

  try {
    if (!error.isEmpty()) {
      throw { status: 400, message: 'Validation Error', error };
    }

    const { email } = req.body;

    const userFound = await checkEmail(email);

    const link = generateSignUpEmail(email);
    const emailTemplate = getHTMLForSignupEmail(link);

    const emailParams = {
      subject: 'Signup Email',
      body: emailTemplate.toString(),
      sender: {
        name: process.env.APP_NAME,
        email: process.env.SENDER_EMAIL.toLowerCase(),
      },
      to: {
        email: email.toLowerCase(),
        name: email.toLowerCase(),
      },
    };

    if (!userFound) {
      // create a user with this email
      await UserModel.create({ email }).catch((err) => {
        throw { status: 500, message: err.message, error: err };
      });
    } else if (userFound?.isRegistered) {
      throw { status: 400, message: 'This email already registered!!' };
    }

    await sendEmail(emailParams).catch((err) => {
      throw { status: 500, message: err.message, error: err };
    });

    return SuccessResponse.send({ res, message: 'Check your Email!!' });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const SignUpWithEmailController = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const error: Result<ValidationError> = validationResult(req);

  try {
    if (!error.isEmpty()) {
      throw { status: 400, message: 'Validation Error', error };
    }

    const { token, firstName, lastName, password } = req.body;

    const { email } = validateJWTTokenForSignUp(token);
    const hashPassword = await generatePasswordHash(password);

    await UserModel.findOneAndUpdate(
      { email },
      { firstName, lastName, password: hashPassword, isRegistered: true },
      { upsert: true }
    ).catch((err) => {
      throw { status: 500, message: err.message, error: err };
    });

    return SuccessResponse.send({ res, message: 'Ok' });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const GoogleSignupController = async (req: express.Request,
  res: express.Response,
  next: express.NextFunction) => {

  const error: Result<ValidationError> = validationResult(req);

  try {

    if (!error.isEmpty()) {
      throw { status: 400, message: 'Validation Error', error };
    }

    const { token } = req.body

    const googleInfo = await googleAuthInfo(token);

    if (!googleInfo) throw { status: 400, message: 'No user Found' }

    const { email = "", name = "", picture = "", sub: userId = "" } = googleInfo

    const userFound: any = await checkEmail(email)

    const spiltName = name?.split(' ')
    const firstName = spiltName?.[0]
    const lastName = spiltName?.[1]

    if (!userFound || !userFound?.isRegistered) {

      await UserModel.findOneAndUpdate(
        { email },
        { firstName, lastName, isRegistered: true, email: email, profileImage: picture, loginType: LoginType.google, googleId: userId },
        { upsert: true }
      ).catch((err) => {
        throw { status: 500, message: err.message, error: err };
      });
    }

    return SuccessResponse.sendWithCookie({ res, message: 'OK', data: { accessToken: token, auth: true } });
  }

  catch (err) {
    console.error(err);
    next(err);
  }

}

export const signInViaEmailController = async (req: express.Request,
  res: express.Response,
  next: express.NextFunction) => {

  const error: Result<ValidationError> = validationResult(req);

  try {
    if (!error.isEmpty()) {
      throw { status: 400, message: 'Validation Error', error };
    }

    const { email, password } = req.body;
    const userFound = await checkEmail(email);

    if (!userFound) throw { status: 400, message: 'Email no valid!!' }

    if (!userFound.password) throw { status: 400, message: 'Password was not set. Try with another sign in method!' }

    const isPasswordValid = await comparePassword(password, userFound.password);

    if (!isPasswordValid) throw { status: 400, message: 'Invalid Password' }

    const accessToken = generateJwtToken({ data: { email: userFound.email, _id: userFound._id }, expires: TOKEN_EXP.access_token });
    const refreshToken = generateJwtToken({ data: { email: userFound.email, _id: userFound._id }, expires: TOKEN_EXP.refresh_token });

    return SuccessResponse.sendWithCookie({ res, message: "Ok", data: { accessToken, refreshToken } })

  }
  catch (err) {
    console.error(err);
    next(err);
  }

}

export const checkUserAuth = async (req: express.Request,
  res: express.Response,
  next: express.NextFunction) => {

  const accessToken = req.cookies?.access_token || '';
  const refreshToken = req.cookies?.refresh_token || '';
  let auth = false;

  try {

    if (!accessToken) throw { status: 401, message: "No auth token provided" }

    const isGoogleToken = accessToken.length > 500;




    if (isGoogleToken) {

      const payload = await googleAuthInfo(accessToken);

      if (!payload) throw { status: 401, message: "Invalid access token" }

      const { sub, exp } = payload;

      if (Date.now() >= exp * 1000) {
        // check expiration
        return SuccessResponse.send({ res, message: 'Ok', data: { auth } });
      }

      const userFound = await checkUserWithGoogleId(sub);

      if (!userFound) auth = false

      auth = true
    }
    else {
      const decoded: any = jwtVerify(accessToken)

      if (!decoded) throw { status: 401, message: "Invalid access token" }
      const { _id } = decoded;

      const userFound = await findUserById(_id)

      if (!userFound) auth = false

      auth = true
    }

    return SuccessResponse.send({ res, message: 'Ok', data: { auth, accessToken } })


  }
  catch (err: any) {
    try {
      // this is the process to re-generate access token with refresh token (JWT only)
      if (err?.message.includes("jwt expired") && accessToken.length < 500 && refreshToken) {

        const { accessToken: newAccessToken, _id } = await refetchToken(refreshToken).catch(err => {
          throw err
        })

        const userFound = await findUserById(_id)

        if (!userFound) auth = false

        res.cookie("access_token", newAccessToken, COOKIE_OPTIONS)
        auth = true
        return SuccessResponse.send({ res, message: 'Ok', data: { auth, accessToken } });
      }
      else if (err.message.includes('Token used too late')) throw { status: 401, message: "Un-authorized" }
      else if (err.message.includes('jwt expired')) throw { status: 401, message: "Un-authorized" }
      else {
        console.error(err)
        next(err)
      }

    }
    catch (err: any) {

      try {
        if (err.message.includes('Token used too late')) throw { status: 401, message: "Un-authorized" }
        else if (err.message.includes('jwt expired')) throw { status: 401, message: "Un-authorized" }
        else {
          console.error(err)
          next(err)
        }
      }

      catch (err: any) {
        console.error(err)
        next(err)
      }
    }

  }

}

export const signOutController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

  try {

    res.cookie("access_token", "", COOKIE_OPTIONS)
    res.cookie("refresh_token", "", COOKIE_OPTIONS)

    return SuccessResponse.send({ res, message: 'Ok', data: { auth: false, accessToken: "", refreshToken: "" } });

  }
  catch (err) {
    console.error(err)
    next(err)

  }

}

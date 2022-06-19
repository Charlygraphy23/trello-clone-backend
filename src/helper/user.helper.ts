import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { convertObjectId, TOKEN_EXP } from '../config';
import { UserModel } from '../models';

const saltRounds = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export type GenerateJwtTokenType = {
  data: any;
  expires: string;
};

type UpdateUserProfileType = {
  firstName: string,
  lastName: string,
  profileImage: string,
  userId: string
}



export const getHTMLForSignupEmail = (link: string) => {
  return `
    <h1>Sign up Email</h1>

    <p>Click to this <a href=${link}>link</a> to proceed</p>
  
  `;
};

export const checkEmail = async (email: string = '') => {
  if (!email) throw { status: 500, message: 'Please provide email' };

  return await UserModel.findOne({ email: email });
};

export const findUserById = async (id: string = '') => {
  if (!id) throw { status: 500, message: 'Please provide id' };

  return await UserModel.findById({ _id: convertObjectId(id) });
};

export const generateJwtToken = ({ data, expires }: GenerateJwtTokenType) => {
  return jwt.sign(data, process.env.JWT_KEY, { expiresIn: expires });
};

export const generateSignUpEmail = (email: string = '') => {
  const tokenData = {
    email,
  };
  const token = generateJwtToken({ data: tokenData, expires: '10m' });

  const link = process.env.FRONT_END_URL + '/signup/welcome?token=' + token;
  return link;
};

export const jwtVerify = (token: string) => {
  return jwt.verify(token, process.env.JWT_KEY);
}

export const validateJWTTokenForSignUp = (token: string): { email: string } => {
  try {
    const decodedData: any = jwtVerify(token)

    return { email: decodedData?.email };
  } catch (err: any) {
    throw { status: 500, message: err.message, error: err };
  }
};

export const generatePasswordHash = async (password: string) => {
  return await bcrypt.hash(password, saltRounds);
};

export const googleAuthInfo = async (token: string) => {

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })

  const payload = ticket.getPayload();


  return payload

}

export const checkUserWithGoogleId = async (id: string) => {
  return await UserModel.findOne({ googleId: id })
    .catch(err => { throw { status: 500, message: err.message, error: err } });
}


export const comparePassword = async (plainPassword: string, hashPassword: string) => {
  return await bcrypt.compare(plainPassword, hashPassword)
}

export const refetchToken = async (token: string) => {
  const decoded: any = jwtVerify(token);
  // checking if refresh token valid
  if (!decoded) throw { status: 401, message: "Invalid refresh token" }

  const { _id, email } = decoded;

  const tokenData = {
    data: {
      _id, email
    },
    expires: TOKEN_EXP.access_token

  }

  const newAccessToken = generateJwtToken(tokenData)

  return { accessToken: newAccessToken, _id, email }
}

export const updateUserProfile = async ({ firstName, lastName, profileImage, userId }: UpdateUserProfileType) => {
  return UserModel.findByIdAndUpdate({ _id: convertObjectId(userId) }, { firstName, lastName, profileImage })
}
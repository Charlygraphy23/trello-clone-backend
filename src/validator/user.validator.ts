import { body } from 'express-validator';

export const GenerateLinkWithEmailValidator = [
  body('email', 'Email Required!').not().isEmpty(),
  body('email', 'Email is not valid').isEmail(),
];

export const SignUpWithEmailValidator = [
  body('token', 'Token Required!').not().isEmpty(),
  body('firstName', 'FirstName Required!').not().isEmpty(),
  body('lastName', 'LastName Required!').not().isEmpty(),
  body('password', 'Password Required!').not().isEmpty(),
  body('token', 'Token is not valid').isJWT(),
];

export const GoogleSignupValidator = [
  body('token', 'Token Required!').not().isEmpty(),
];


export const signInViaEmailValidator = [
  body('email', 'Email Required!').not().isEmpty(),
  body('email', 'Email is not valid').isEmail(),
  body('password', 'Password Required!').not().isEmpty(),
]

export const updateUserValidator = [
  body('firstName', 'firstName Required!').not().isEmpty(),
  body('lastName', 'lastName Required!').not().isEmpty(),
]

export const inviteValidator = [
  body('email', 'Email Required!').not().isEmpty(),
  body('email', 'Email is not valid').isEmail(),
  body('boardId', 'boardId is not valid').isMongoId(),
]
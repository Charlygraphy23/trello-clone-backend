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

export const acceptInvitationValidator = [
  body('token', 'inviteId Required!').not().isEmpty()
]

export const deleteTaskByIdValidator = [
  body('taskId', 'inviteId Required!').isUUID(),
  body('listId', 'inviteId Required!').isUUID(),
  body('boardId', 'inviteId Required!').isMongoId(),
]

export const deleteColumnValidator = [
  body('boardId', 'inviteId Required!').isMongoId(),
  body('listId', 'inviteId Required!').isUUID(),
]
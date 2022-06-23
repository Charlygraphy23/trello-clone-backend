import express = require('express');
import { v2 } from 'cloudinary';
import { validationResult } from 'express-validator';
import { sendEmail, SuccessResponse } from '../../config';
import '../../config/cloudinary.config';
import { checkInviteEmail, createNewInvitation, findBoardById, generateInvitationLink, updateUserProfile } from '../../helper';

export const getUserProfileController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        // @ts-expect-error
        const user = req.user;

        user.password = undefined;

        return SuccessResponse.send({ res, message: "Ok", data: user })

    }

    catch (err) {
        console.error(err)
        next(err)
    }

}


export const updateProfile = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { firstName, lastName, profileImage, hasImageChange } = req.body

        // @ts-expect-error
        const user = req.user;

        if (hasImageChange && user.profileImage) {

            const imagePath: string = user.profileImage.split('--/').pop()
            const filterPrevImagePath = imagePath.split('/').slice(1).join('/')

            const publicId = filterPrevImagePath.split('.')[0];
            console.log("publicId", publicId)

            await v2.uploader.destroy(publicId)
                .then(() => {
                    console.log("Delete Done")
                })
                .catch(err => { throw err })
        }

        await updateUserProfile({ firstName, lastName, profileImage, userId: user._id.toString() })
            .catch(err => { throw err });

        return SuccessResponse.send({ res, message: "Ok", data: user })

    }

    catch (err) {
        console.error(err)
        next(err)
    }

}


export const inviteFriends = async (req: express.Request, res: express.Response, next: express.NextFunction) => {


    try {

        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { email, boardId } = req.body;

        const [isEmailAlreadyExists, isBoardExist] = await Promise.all([
            checkInviteEmail(email),
            findBoardById(boardId)
        ]).catch(err => { throw err })


        if (!isBoardExist) throw { status: 422, message: "Board not found!!" }
        if (isEmailAlreadyExists) throw { status: 422, message: 'Invitation Already send' + isEmailAlreadyExists.accepted ? 'and accepted!!' : '' }

        const invitationData = await createNewInvitation({ email, boardId }).catch(err => { throw err })

        const link = generateInvitationLink({
            id: String(invitationData?._id) ?? ''
        });

        const emailParams = {
            subject: 'Invitation Email',
            body: `
            <h1>Invitation Email</h1>
        
            <p>Click to this <a href=${link}>link</a> to proceed</p>
          
          `,
            sender: {
                name: process.env.APP_NAME,
                email: process.env.SENDER_EMAIL.toLowerCase(),
            },
            to: {
                email: email.toLowerCase(),
                name: email.toLowerCase(),
            },
        };





        await sendEmail(emailParams).catch((err) => {
            throw { status: 500, message: err.message, error: err };
        });

        return SuccessResponse.send({ status: 200, message: "Ok", res })

    }
    catch (err) {
        console.error(err)
        next(err)
    }

}
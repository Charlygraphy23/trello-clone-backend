import express = require('express');
import { v2 } from 'cloudinary';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { MEMBER_ROLES, sendEmail, SuccessResponse } from '../../config';
import '../../config/cloudinary.config';
import { checkInviteEmail, createBoardMember, createNewInvitation, findBoardById, generateInvitationLink, getInviteById, jwtVerify, updateInvitation, updateUserProfile } from '../../helper';

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
            checkInviteEmail(email, boardId),
            findBoardById(boardId)
        ]).catch(err => { throw err })


        if (!isBoardExist) throw { status: 422, message: "Board not found!!" }
        if (isEmailAlreadyExists) throw { status: 422, message: `Invitation Already send ${isEmailAlreadyExists.accepted ? 'and accepted!!' : ''}` }

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
                name: process.env.HD_APP_NAME,
                email: process.env.HD_SENDER_EMAIL.toLowerCase(),
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

export const acceptInvitationController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const session = await mongoose.startSession();
    session.startTransaction()


    try {

        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { token } = req.body;
        // @ts-expect-error
        const user = req.user

        const decoded: any = jwtVerify(token)

        if (!decoded) throw { status: 422, message: "Invalid token" }

        const inviteId = decoded?.id;

        if (!inviteId) throw { status: 422, message: "Invalid inviteId!!" }

        const inviteDetails = await getInviteById(inviteId).catch(err => { throw err })


        if (!inviteDetails) throw { status: 422, message: "Invalid Invitation!!" }
        if (inviteDetails.email !== user.email) throw { status: 422, message: `Invitation email not matched!!` }
        if (inviteDetails.accepted) throw { status: 422, message: `Invitation already accepted` }

        if (!inviteDetails?.boardId) throw { status: 500, message: "Board Id Invalid!!" }

        const boardDetails = await findBoardById(inviteDetails?.boardId?.toString()).catch(err => { throw err })

        if (!boardDetails?._id || !boardDetails?.workspace) throw { status: 500, message: "Board Details Invalid!!" }

        await createBoardMember({ session, userId: user._id, role: MEMBER_ROLES.MEMBER, boardId: boardDetails?._id.toString(), workspace: boardDetails.workspace?.toString() })

        await updateInvitation({
            id: inviteId, data: {
                accepted: true
            },
            session
        }).catch(err => { throw err })

        await session.commitTransaction()
        session.endSession()

        return SuccessResponse.send({ status: 200, message: "Ok", res })

    }
    catch (err) {

        await session.abortTransaction()
        session.endSession()

        console.error(err)
        next(err)
    }

}

export const getInviteInfoController = async (req: express.Request, res: express.Response, next: express.NextFunction) => {


    try {

        const error = validationResult(req)

        if (!error.isEmpty()) throw { status: 422, message: "Validation Error", error }

        const { token } = req.body;

        if (!token) throw { status: 422, message: "Please provide token!!" }

        const decoded: any = jwtVerify(token)

        if (!decoded) throw { status: 422, message: "Invalid token" }

        const inviteId = decoded?.id;

        const data = await getInviteById(inviteId).catch(err => { throw err })

        return SuccessResponse.send({ status: 200, message: "Ok", res, data })

    }
    catch (err) {
        console.error(err)
        next(err)
    }

}
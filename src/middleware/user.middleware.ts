import express from 'express';
import { COOKIE_OPTIONS } from '../config';
import { checkUserWithGoogleId, findUserById, googleAuthInfo, jwtVerify, refetchToken } from '../helper';

export default async (req: express.Request,
    res: express.Response,
    next: express.NextFunction) => {


    const accessToken = req.cookies.access_token || '';
    const refreshToken = req.cookies.refresh_token || "";

    try {

        if (!accessToken) throw { status: 401, message: "No auth token provided" }

        const isGoogleToken = accessToken.length > 500;


        if (isGoogleToken) {

            console.log("Proceeding with google token")

            const payload = await googleAuthInfo(accessToken);

            if (!payload) throw { status: 401, message: "Invalid access token" }

            const { sub } = payload;

            const userFound = await checkUserWithGoogleId(sub);

            if (!userFound) throw { status: 401, message: "Un-authorized" }

            // @ts-expect-error
            req.user = userFound;
        }
        else {
            console.log("Proceeding with JWT token")

            const decoded: any = jwtVerify(accessToken);

            if (!decoded) throw { status: 401, message: "Invalid access token" }

            const { _id } = decoded;

            const userFound = await findUserById(_id)

            if (!userFound) throw { status: 401, message: "Un-authorized" }

            // @ts-expect-error
            req.user = userFound;
        }

        return next()

    }

    catch (err: any) {

        try {
            // this is the process to re-generate access token with refresh token (JWT only)
            if (err.message.includes('jwt expired') && accessToken.length < 500 && refreshToken) {
                // re generate access token
                console.log("Re-Fetch Jwt")
                const { accessToken: newAccessToken, _id } = await refetchToken(refreshToken).catch(err => {
                    throw err
                })


                const userFound = await findUserById(_id)

                if (!userFound) throw { status: 401, message: "Un-authorized" }

                res.cookie("access_token", newAccessToken, COOKIE_OPTIONS)
                // @ts-expect-error
                req.user = userFound;

                return next()

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
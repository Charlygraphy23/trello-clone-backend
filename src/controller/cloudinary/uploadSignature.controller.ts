import { v2 } from 'cloudinary';
import express from 'express';
import { SuccessResponse } from '../../config';
import '../../config/cloudinary.config';



export const getCloudinarySignature = async (req: express.Request, res: express.Response, next: express.NextFunction) => {


    try {

        const { folder } = req.body;


        const timestamp = Math.round((new Date).getTime() / 1000);
        const apiSecret = v2.config()?.api_secret ?? ''

        const signature = v2.utils.api_sign_request({
            timestamp: timestamp,
            transformation: 'q_auto:good',
            folder: folder ?? process.env.HD_CLOUDINARY_DEFAULT_FOLDER,
            upload_preset: process.env.HD_CLOUDINARY_PRESET
        }, apiSecret);

        return SuccessResponse.send({ res, message: "Ok", data: { timestamp, signature } })

    }
    catch (err) {
        console.error(err)
        next(err)
    }

}

import { body } from "express-validator";

export const createWorkSpaceValidator = [
    body('name', 'Name Required!').not().isEmpty(),
    body('description', 'Description Required!').not().isEmpty(),
]
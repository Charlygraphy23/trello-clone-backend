import { body } from "express-validator";



export const createBoardValidator = [
    body("name", "Please provide name!!").not().isEmpty(),
    body("backgroundColor", "Please provide backgroundColor!!").not().isEmpty(),
    body("workspace", "Please provide workspace id!!").isMongoId(),
]

export const addLabelValidator = [
    body("name", "Please provide name!!").not().isEmpty(),
    body("labelId", "Please provide labelId!!").isUUID(),
    body("backgroundColor", "Please provide backgroundColor!!").not().isEmpty(),
    body("boardId", "Please provide boardId!!").isMongoId(),
]

export const updateLabelValidator = [
    body("labelId", "Please provide labelId!!").isUUID(),
    body("name", "Please provide name!!").not().isEmpty(),
    body("backgroundColor", "Please provide backgroundColor!!").not().isEmpty(),
]
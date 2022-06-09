import { body } from "express-validator";
import { CARD_TYPE } from "../config";

export const addListValidator = [
    body("title", "Please provide title!!").not().isEmpty(),
    body("listId", "Please provide listId!!").not().isEmpty(),
    body("listId", "listId should be uuid!!").isUUID(),
    body("boardId", "Please provide a valid boardId").isMongoId(),
]

export const addTaskValidator = [
    body("content", "Please provide title!!").not().isEmpty(),
    body("taskId", "Please provide listId!!").isUUID(),
    body("listId", "listId should be uuid!!").isUUID(),
    body("boardId", "Please provide a valid boardId").isMongoId(),
]

export const updateTaskAndColumnsPositionValidator = [
    body("type", "Please provide type!!").not().isEmpty(),
    body("type", "Please provide correct type!!").not().isIn([CARD_TYPE]),
    body("listId", "listId should be uuid!!").isUUID(),
    body("order", "order should be number").isNumeric(),
]

export const updateTaskLabelValidator = [

    body("labelId", "listId should be uuid!!").isUUID(),
    body("taskId", "listId should be uuid!!").isUUID(),

]

export const updateCheckListControllerValidator = [
    body("title", "title should not be empty!!").not().isEmpty(),
    body("checkListId", "checkListId should be uuid!!").isUUID(),
    body("isDone", "isDone should be boolean!!").isBoolean(),
    body("taskId", "taskId should be uuid!!").isUUID(),
    body("checkListGroupId", "taskId should be uuid!!").isUUID()
]
export const addCheckListGroupValidator = [
    body("title", "title should not be empty!!").not().isEmpty(),
    body("taskId", "taskId should be uuid!!").isUUID(),
    body("checkListGroupId", "taskId should be uuid!!").isUUID()
]
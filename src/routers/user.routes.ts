import express from 'express';
import {
  addCheckListGroupController,
  addLabelController,
  addListController,
  addTaskController,
  addTaskInfoController,
  checkUserAuth, createBoardController, createWorkSpaceController, deleteCheckListController, deleteCheckListGroupController, GenerateLinkWithEmailController,
  getBoardDataController,
  getUserProfileController,
  GoogleSignupController,
  homeController,
  signInViaEmailController,
  signOutController,
  SignUpWithEmailController,
  updateCheckListController,
  updateTaskAndColumnsPositionController,
  updateTaskLabelController
} from '../controller';
import { UserMiddleware } from '../middleware';
import {
  addCheckListGroupValidator,
  addLabelValidator,
  addListValidator,
  addTaskValidator,
  createBoardValidator,
  createWorkSpaceValidator, GenerateLinkWithEmailValidator,
  GoogleSignupValidator,
  signInViaEmailValidator,
  SignUpWithEmailValidator,
  updateCheckListControllerValidator,
  updateLabelValidator,
  updateTaskAndColumnsPositionValidator,
  updateTaskLabelValidator
} from '../validator';


const router = express.Router();

router.post(
  '/generate-token-with-email',
  GenerateLinkWithEmailValidator,
  GenerateLinkWithEmailController
);

router.put(
  '/signup-with-email',
  SignUpWithEmailValidator,
  SignUpWithEmailController
);

router.post(
  '/signup-signin-google',
  GoogleSignupValidator,
  GoogleSignupController
);

router.post(
  '/signin-with-email',
  signInViaEmailValidator,
  signInViaEmailController
);

router.get(
  '/check-auth',
  checkUserAuth
);

router.get(
  '/signout',
  signOutController
);

// auth middleware
router.use(UserMiddleware)

router.get(
  '/profile',
  getUserProfileController
);

router.post(
  '/create-workspace',
  createWorkSpaceValidator,
  createWorkSpaceController
);

router.get(
  '/home',
  homeController
);

router.post(
  '/board',
  createBoardValidator,
  createBoardController
);


router.post(
  '/add-list',
  addListValidator,
  addListController
);

router.post(
  '/get-board-data',
  getBoardDataController
);


router.post(
  '/add-task',
  addTaskValidator,
  addTaskController
);

router.put(
  '/update-task-column',
  updateTaskAndColumnsPositionValidator,
  updateTaskAndColumnsPositionController
);

router.put('/add-task-info', addTaskInfoController)

router.post('/add-labels', addLabelValidator, addLabelController)
router.put('/update-labels', updateLabelValidator, addLabelController)

router.put('/update-task-labels', updateTaskLabelValidator, updateTaskLabelController)
router.put('/update-checklist', updateCheckListControllerValidator, updateCheckListController)
router.post('/add-checklist-group', addCheckListGroupValidator, addCheckListGroupController)
router.delete('/delete-checkList/:checkListId', deleteCheckListController)
router.delete('/delete-checkList-group/:checkListGroupId', deleteCheckListGroupController)

export default router;

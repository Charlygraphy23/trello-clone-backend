import express from 'express';
import {
  acceptInvitationController,
  addCheckListGroupController,
  addLabelController,
  addListController,
  addTaskCommentController,
  addTaskController,
  addTaskInfoController,
  checkUserAuth, createBoardController, createWorkSpaceController, deleteCheckListController, deleteCheckListGroupController, deleteCommentController, deleteLabelController, deleteTaskByIdController, GenerateLinkWithEmailController,
  getAllCommentsOfTaskController,
  getBoardDataController,
  getCloudinarySignature,
  getInviteInfoController,
  getUserProfileController,
  GoogleSignupController,
  homeController,
  inviteFriends,
  signInViaEmailController,
  signOutController,
  SignUpWithEmailController,
  toggleMembersInTask,
  updateBoardBackgroundController,
  updateCheckListController,
  updateLabelController,
  updateProfile,
  updateTaskAndColumnsPositionController,
  updateTaskLabelController
} from '../controller';
import { UserMiddleware } from '../middleware';
import {
  acceptInvitationValidator,
  addCheckListGroupValidator,
  addLabelValidator,
  addListValidator,
  addTaskValidator,
  createBoardValidator,
  createWorkSpaceValidator, deleteTaskByIdValidator, GenerateLinkWithEmailValidator,
  GoogleSignupValidator,
  inviteValidator,
  signInViaEmailValidator,
  SignUpWithEmailValidator,
  updateCheckListControllerValidator,
  updateLabelValidator,
  updateTaskAndColumnsPositionValidator,
  updateTaskLabelValidator,
  updateUserValidator
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
router.put('/update-labels', updateLabelValidator, updateLabelController)
router.post('/delete-labels', deleteLabelController)

router.put('/update-task-labels', updateTaskLabelValidator, updateTaskLabelController)
router.put('/update-checklist', updateCheckListControllerValidator, updateCheckListController)
router.post('/add-checklist-group', addCheckListGroupValidator, addCheckListGroupController)
router.delete('/delete-checkList/:checkListId', deleteCheckListController)
router.delete('/delete-checkList-group/:checkListGroupId', deleteCheckListGroupController)
router.post('/toggle-members-task', toggleMembersInTask)
router.post('/add-comment-task', addTaskCommentController)
router.get('/all-comments-task/:taskId', getAllCommentsOfTaskController)
router.delete('/delete-comment/:commentId', deleteCommentController)
router.put('/change-background', updateBoardBackgroundController)
router.put('/update-profile', updateUserValidator, updateProfile)
router.post('/get-signature', getCloudinarySignature)
router.post('/invite-info', getInviteInfoController)
router.post('/invite', inviteValidator, inviteFriends)
router.patch('/accept-invite', acceptInvitationValidator, acceptInvitationController)
router.post('/delete-task-by-id', deleteTaskByIdValidator, deleteTaskByIdController)


export default router;

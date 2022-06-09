import { WorkSpaceModel, WorkspaceModelType } from '../models'



export const createWorkspace = async ({ name, description, createdBy }: WorkspaceModelType): Promise<WorkspaceModelType> => {

    return await WorkSpaceModel.create({
        name, description, createdBy
    }).catch(err => { throw { status: 500, message: err.message, error: err } })

}
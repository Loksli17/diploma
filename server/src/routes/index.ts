import {Router as ExpressRouter} from 'express';
import userController    from '../controllers/userController';
import projectController from '../controllers/projectController';
import authController    from '../controllers/authController';

export default class Router{
    private static router: ExpressRouter = ExpressRouter();

    public static get routes(){
        this.router.use(authController.checkToken),
        this.router.use('/auth',    authController.routes());
        this.router.use('/project', projectController.routes());
        this.router.use('/user',    userController.routes());

        return this.router;
    }

}
   
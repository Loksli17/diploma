import {Router as ExpressRouter} from 'express';

import userController         from '../controllers/userController';
import projectController      from '../controllers/projectController';
import authController         from '../controllers/authController';
import notificationController from '../controllers/notificationController';
import chatController         from '../controllers/chatController';


export default class Router{
    private static router: ExpressRouter = ExpressRouter();

    public static get routes(){
        this.router.use(authController.checkToken),
        this.router.use('/auth',         authController.routes());
        this.router.use('/project',      projectController.routes());
        this.router.use('/user',         userController.routes());
        this.router.use('/notification', notificationController.routes());
        this.router.use('/chat',         chatController.routes());

        return this.router;
    }

}
   
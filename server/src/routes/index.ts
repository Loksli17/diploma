import {Router as ExpressRouter} from 'express';
import indexController from '../controllers/indexController';
import authController from '../controllers/authController';

export default class Router{
    private static router: ExpressRouter = ExpressRouter();

    public static get routes(){
        this.router.use('/',     indexController.routes());
        this.router.use('/auth', authController.routes());

        return this.router;
    }

}
   
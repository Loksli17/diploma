import {Router, Request, Response, NextFunction} from 'express';

export default class AuthController{
    private static router: Router = Router();

    private static getLoginApi(req: Request, res: Response){
        res.status(200).send('login');
    }

    private static getSignupApi(req: Request, res: Response){
        res.status(200).send('signup');
    }

    public static routes(){
        this.router.all(`/login`, this.getLoginApi);
        this.router.all(`/signup`, this.getSignupApi);
        return this.router;
    }
}
import {Router, Request, Response, NextFunction} from 'express';

export default class AuthController{
    private static router: Router = Router();

    private static async loginApi(req: Request, res: Response){
        res.status(200).send('login');
    }

    private static async signupApi(req: Request, res: Response){
        res.status(200).send('signup');
    }

    public static routes(){
        this.router.all(`/login`, this.loginApi);
        this.router.all(`/signup`, this.signupApi);
        return this.router;
    }
}
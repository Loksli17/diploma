import {Router, Request, Response, NextFunction} from 'express';

export default class AuthController{
    private static router: Router = Router();

    private static async login(req: Request, res: Response){
        res.status(200).send('login');
    }

    private static async signup(req: Request, res: Response){
        console.log(req.body);
        res.status(200).send('good');
    }

    public static routes(){
        this.router.all(`/login`, this.login);
        this.router.all(`/signup`, this.signup);
        return this.router;
    }
}
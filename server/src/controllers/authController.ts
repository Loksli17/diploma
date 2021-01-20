import {Router, Request, Response, NextFunction} from 'express';

import {getRepository}             from 'typeorm';
import User                        from '../models/User';
import {validate, ValidationError} from 'class-validator';

export default class AuthController{
    private static router: Router = Router();

    private static async login(req: Request, res: Response){
        res.status(200).send('login');
    }


    private static async signup(req: Request, res: Response){

        interface POST{
            user: {
                lastName : string,
                firstName: string,
                login    : string,
                email    : string,
                password : string,
            };
        }

        let 
            result        : any  , 
            POST          : POST = req.body,
            validateResult: Array<ValidationError>,
            user          : User = new User(); 

        if(POST.user == undefined){
            res.status(500).send({error: 'Data about `user` has not sended'});
        }

        user.lastName  = POST.user.lastName;
        user.firstName = POST.user.firstName;
        user.login     = POST.user.login;
        user.email     = POST.user.email;
        user.password  = POST.user.password;

        validateResult = await validate(user);

        if(validateResult.length){
            res.status(200).send({msg: 'bad', errors: validateResult});
            return;
        }

        // try{
        //     result = await getRepository(User).insert(user);
        // }catch(err){
        //     throw new Error(err)
        // }
    
        console.log(result);
        res.status(200).send({body: req.body});
    }


    public static routes(){
        this.router.all(`/login`, this.login);
        this.router.all(`/signup`, this.signup);
        return this.router;
    }
}
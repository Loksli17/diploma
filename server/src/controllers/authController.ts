import {Router, Request, Response, NextFunction} from 'express';

import {getRepository}             from 'typeorm';
import User                        from '../models/User';
import {validate, ValidationError} from 'class-validator';
import Parser                      from '../libs/parser';
import crypto                      from 'crypto-js';

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
            user          : User; 

        if(POST.user == undefined){
            res.status(500).send({error: 'Data about `user` has not sended'});
        }

        user           = new User(POST.user);
        validateResult = await validate(user);

        if(validateResult.length){
            res.status(202).send({msg: 'Bad validation', errors: Parser.parseValidateError(validateResult)});
            return;
        }

        user.password = crypto.SHA256(user.password).toString();

        try{
            await getRepository(User).insert(user);
        }catch(err){
            res.status(500).send({msg: 'Error with datebase'});
            throw new Error(err)
        }
    
        res.status(201).send({msg: `User ${user.login} has been registered successfully`});
    }


    public static routes(){
        this.router.all(`/login`, this.login);
        this.router.all(`/signup`, this.signup);
        return this.router;
    }
}
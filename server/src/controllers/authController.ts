import {Router, Request, Response, NextFunction} from 'express';

import {getRepository}             from 'typeorm';
import User                        from '../models/User';
import {validate, ValidationError} from 'class-validator';
import Parser                      from '../libs/parser';
import crypto                      from 'crypto-js';
import jwt                         from 'jsonwebtoken';
import config                      from '../config';


export default class AuthController{

    private static router: Router = Router();

    private static async login(req: Request, res: Response){

        interface POST{
            password: string,
            email   : string,
        }

        let 
            POST : POST            = req.body,
            token: string          = '',
            user : User | undefined;

        if(POST.email == undefined){
            res.status(500).send({error: 'Data about `emil` has not sended'});
        }

        if(POST.password == undefined){
            res.status(500).send({error: 'Data about `emil` has not sended'});
        }

        user = await getRepository(User).findOne({where: {email: POST.email}});

        if(user == undefined){
            res.status(400).send({msg: 'Bad validation', errors: [{msg: `User with this email doesn' exists`, name: 'email'}]});
            return;
        }

        if(user.password !== crypto.SHA256(POST.password).toString()){
            res.status(400).send({msg: 'Bad validation', errors: [{msg: `Password uncorrect`, name: 'password'}]});
            return;
        }

        token = jwt.sign({id: user.id}, config.secret.jwt, {expiresIn: '1h'});

        res.status(200).send({token: token, user: user, msg: `${user.firstName}, welcome to Draw Together`});
    }

    private static async createTokens(req: Request, res: Response){

    }

    public static async checkToken(req: Request, res: Response, next: NextFunction){

        if(req.originalUrl == '/auth/login' || req.originalUrl == '/auth/singup'){
            next();
            return;
        }
       
        let token: string | undefined = req.headers.authorization;

        if(token == undefined){
            res.status(401).send({});
            return;
        }
        
        try {
            if(jwt.verify(token, config.secret.jwt)){
                next();
                return;
            }else{
                res.status(401).send({});
            }
        }catch(err){
            res.status(401).send({});
        }
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
            res.status(400).send({msg: 'Bad validation', errors: Parser.parseValidateError(validateResult)});
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
        this.router.all(`/get-tokens`, this.createTokens);
        return this.router;
    }
}
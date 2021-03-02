import {Router, Request, Response, NextFunction} from 'express';

import {getRepository}             from 'typeorm';
import User                        from '../models/User';
import {validate, ValidationError} from 'class-validator';
import Parser                      from '../libs/parser';
import crypto                      from 'crypto-js';
import jwt                         from 'jsonwebtoken';
import config                      from '../config';
import ErrorMessage                from '../libs/error';


export default class AuthController{

    private static router: Router = Router();


    private static async login(req: Request, res: Response){

        interface POST{
            password: string,
            email   : string,
        }

        let 
            POST : POST   = req.body,
            token: string = '',
            user : User | undefined;

        if(POST.email == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('email')});
            return;
        }

        if(POST.password == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('password')});
            return;
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

        token = jwt.sign({id: user.id}, config.secret.jwt, {expiresIn: '15m'});
        console.log(token);
        res.status(200).send({token: token, user: user, msg: `${user.firstName}, welcome to Draw Together`});
    }


    private static async createToken(req: Request, res: Response){

        interface POST{
            id: number;
        }

        let
            token: string = '',
            user : User | undefined, 
            POST : POST = req.body;

        if(POST.id == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('user.id')});
            return;
        }

        user = await getRepository(User).findOne(POST.id);

        if(user == undefined){
            res.status(400).send({error: `User with id = ${POST.id} hasn't founded`});
            return;
        }

        token = jwt.sign({id: user.id}, config.secret.jwt, {expiresIn: '15m'});
        console.log(token);
        res.status(200).send({token: token});
    }


    public static async checkToken(req: Request, res: Response, next: NextFunction){

        let authUrl: Array<string> = ['/auth/login', '/auth/signup', '/auth/get-token'];

        if(authUrl.includes(req.originalUrl)){
            next();
            return;
        }
       
        let token: string | undefined = req.headers.authorization;

        if(token == undefined){
            res.status(401).send({msg: ErrorMessage.notFound('token')});
            return;
        }
        
        try {
            jwt.verify(token, config.secret.jwt);
            next();
        }catch(err){
            console.log('this', err);
            res.status(401).send({msg: err.message});
            return;
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
            POST          : POST = req.body,
            validateResult: Array<ValidationError>,
            user          : User; 

        if(POST.user == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('user')});
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
            res.status(400).send({msg: 'Error with datebase'});
            throw new Error(err)
        }
    
        res.status(201).send({msg: `User ${user.login} has been registered successfully`});
    }

    public static routes(){
        this.router.all(`/login`, this.login);
        this.router.all(`/signup`, this.signup);
        this.router.all(`/get-token`, this.createToken);
        return this.router;
    }
}
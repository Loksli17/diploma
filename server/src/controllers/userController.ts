import {validate, ValidationError} from 'class-validator';
import {Router, Request, Response} from 'express';

import {getRepository} from 'typeorm';
import Parser          from '../libs/parser';
import User            from '../models/User';


export default class UserController{

    private static router: Router = Router();

    private static async getFriends(req: Request, res: Response){
        
        interface POST{
            take: number;
            skip: number;
        }

        let
            POST   : POST        = req.body,
            friends: Array<User> = [];

        if(POST.take == undefined){
            res.status(400).send({error: 'Data about Take has not sended'});
            return;
        }

        if(POST.skip == undefined){
            res.status(400).send({error: 'Data about Skip has not sended'});
            return;
        }

        try{
            friends = await getRepository(User).createQueryBuilder()
                .leftJoin('user_has_user', 'uhu', 'uhu.userId1 = :id or uhu.userId2 = :id', {id: 1})
                .where('user.id != :id', {id: 1})
                .skip(POST.skip)
                .take(POST.take)
                .getMany();
        }catch(err){
            throw new Error(err);
        }

        res.status(200).send({friends: friends});
    }

    
    private static async searchUser(req: Request, res: Response){

        interface POST{
            login?: string;
            id   ?: number;
            email?: string;
        }

        // TODO DON'T FORGET ABOUT LIKE
        let 
            POST: POST         = req.body,
            users: Array<User> = await getRepository(User).createQueryBuilder()
                .where('user.login = :login', {login: POST.login})
                .getMany();

        res.status(200).send({users: users});
    }


    private static async editUser(req: Request, res: Response){

        interface POST{
            user: {
                id       :   number;
                login    : string;
                email    : string;
                firstName: string;
                lastName : string;
            }
        }

        let 
            user          : User | undefined,
            validateResult: Array<ValidationError>,
            POST          : POST = req.body;

        if(POST.user == undefined){
            res.status(400).send({error: 'Data about `user` has not sended'});
        }

        try {
            user = await getRepository(User).findOne(POST.user.id);
        }catch(err){
            res.status(400).send({error: 'Error with DB'});
            throw new Error(err);
        }
        
        if(user == undefined){
            res.status(400).send({error: 'Data about `user` has not sended'});
            return;
        }

        user.login     = POST.user.login;
        user.firstName = POST.user.firstName;
        user.lastName  = POST.user.lastName;
        user.email     = POST.user.email;

        validateResult = await validate(user);

        if(validateResult.length){
            console.log(Parser.parseValidateError(validateResult));
            res.status(400).send({msg: 'Bad validation', errors: Parser.parseValidateError(validateResult)});
            return;
        }

        try{
            await getRepository(User).update(user.id!, user);
        }catch(err){
            res.status(400).send({error: 'Error with DB'});
            throw new Error(err);
        }

        res.status(201).send({msg: `You data has chanded successfully`, user: user});
    }

    public static routes(){
        this.router.all('/get-friends', this.getFriends);
        this.router.all('/search-user', this.searchUser);
        this.router.all('/edit', this.editUser);
        return this.router;
    }
}
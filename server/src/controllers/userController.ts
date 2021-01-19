import {Router, Request, Response} from 'express';

import {getRepository} from 'typeorm';
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
            res.status(500).send({error: 'Data about Take has not sended'});
            return;
        }

        if(POST.skip == undefined){
            res.status(500).send({error: 'Data about Skip has not sended'});
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

    public static routes(){
        this.router.all('/get-friends', this.getFriends);
        this.router.all('/search-User', this.searchUser);
        return this.router;
    }
}
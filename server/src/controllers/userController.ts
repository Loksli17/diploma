import {Router, Request, Response} from 'express';

import {getRepository} from 'typeorm';
import User            from '../models/User';

export default class UserController{

    private static router: Router = Router();

    private static async getFriendsApi(req: Request, res: Response){
        
        interface POST{
            take: number;
            skip: number;
        }

        let
            POST   : POST        = req.body,
            friends: Array<User> = [];

        if(POST.take == undefined){
            res.status(500).send({error: 'Data about take has not sended'});
            return;
        }

        if(POST.skip == undefined){
            res.status(500).send({error: 'Data about skip has not sended'});
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


    public static routes(){
        this.router.all('/get-friends' , this.getFriendsApi);
        return this.router;
    }
}
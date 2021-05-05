import {Router, Request, Response} from 'express';
import {getRepository, InsertResult} from 'typeorm';


import Chat         from '../models/Chat';
import User         from '../models/User';
import ErrorMessage from '../libs/error';
import PostModule   from '../libs/post';
import { connected } from 'process';


export default class ChatController{

    private static router: Router = Router();


    private static async getChat(req: Request, res: Response): Promise<void>{
        interface POST{
            user1Id: number,
            user2Id: number,
        }

        let 
            postErrors: Array<keyof POST> = [],
            chat      : Chat | undefined,
            POST      : POST              = req.body;
        
        postErrors = PostModule.checkData(POST, ['user1Id', 'user2Id']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try{
            chat = await getRepository(Chat).createQueryBuilder('chat')
                .where(
                    "(chat.user1Id = :id1 && chat.user2Id = :id2) || (chat.user1Id = :id2 && chat.user2Id = :id1)",
                    {id1: POST.user1Id, id2: POST.user2Id}
                )
                .leftJoinAndSelect('chat.user1', 'user as u1')
                .leftJoinAndSelect('chat.user2', 'user as u2')
                .getOne();
            
            if(chat == undefined){
                res.status(200).send({msg: "Chat has not been created", chat: undefined});
                return;
            }

        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            console.error(err);
        }

        res.status(200).send({chat: chat}); 
    }


    private static async createChat(req: Request, res: Response): Promise<void>{

        interface POST{
            user1Id: number,
            user2Id: number,
        }

        let 
            postErrors: Array<keyof POST> = [],
            chat      : Chat | undefined  = new Chat(),
            POST      : POST              = req.body;
        
        postErrors = PostModule.checkData(POST, ['user1Id', 'user2Id']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        chat.changeFields(POST);

        try {
            const result: InsertResult = await getRepository(Chat).insert(chat);
            chat.id = result.identifiers[0].id;
            res.status(200).send({chat: chat});
        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            console.error(err);
        }
    }


    public static routes(){
        this.router.post('/get', this.getChat);
        this.router.post('/add', this.createChat);

        return this.router;
    }

}
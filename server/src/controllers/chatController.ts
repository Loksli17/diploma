import {Router, Request, Response} from 'express';
import {getRepository, InsertResult} from 'typeorm';

import {isRgbColor, validate, ValidationError} from 'class-validator';
import Parser                      from '../libs/parser';
import Chat                        from '../models/Chat';
import User                        from '../models/User';
import ErrorMessage                from '../libs/error';
import PostModule                  from '../libs/post';
import Message                     from '../models/Message';


export default class ChatController{

    private static router: Router = Router();


    private static async getChat(req: Request, res: Response): Promise<void>{
        interface POST{
            user1Id: number,
            user2Id: number,
        }

        let 
            postErrors: Array<keyof POST>          = [],
            chat      : Chat | undefined,
            messages  : Array<Message> | undefined = [],
            POST      : POST                       = req.body;
        
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

            if(chat!.messages == undefined) chat!.messages = [];

            messages = await getRepository(Message).createQueryBuilder()
                    .where('chatId = :id', {id: chat!.id})
                    .take(50)
                    .orderBy('id', "DESC")
                    .getMany();

            chat!.messages = messages == undefined ? [] : messages.reverse();

        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            console.error(err);
        }

        res.status(200).send({chat: chat}); 
    }


    private static async getChats(req: Request, res: Response): Promise<void>{
        interface POST{
            userId: number,
        }

        let 
            postErrors: Array<keyof POST> = [],
            chats     : Array<Chat>       = [],
            POST      : POST              = req.body;
        
        postErrors = PostModule.checkData(POST, ['userId']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try {
            const chatsDb: Array<any> = await getRepository(Chat).createQueryBuilder('chat')
                .where('user1Id = :id || user2Id = :id', {id: POST.userId})
                .innerJoinAndSelect('message', 'm', 'm.chatId = chat.id')
                .innerJoinAndSelect('user', 'u', 'u.id = m.userId')
                .innerJoinAndSelect('user', 'u1', 'u1.id = chat.user1Id')
                .innerJoinAndSelect('user', 'u2', 'u2.id = chat.user2Id')
                .groupBy('chat_id')
                .getRawMany();
                
            chats = chatsDb.map((item) => {
                let chat: Chat = new Chat();

                chat.lastMessage             = new Message();
                chat.lastMessage.text        = item['m_text'];
                chat.lastMessage.user        = new User();
                chat.lastMessage.user.login  = item['u_login'];
                chat.lastMessage.user.avatar = item['u_avatar'];

                chat.user1Id = item['chat_user1Id'];
                chat.user2Id = item['chat_user2Id'];

                if(item['u2_id'] != POST.userId){
                    chat.user2 = new User();
                    chat.user2.login = item['u2_login'];
                    chat.user2.email = item['u2_email'];
                }else{
                    chat.user2 = new User();
                    chat.user2.login = item['u1_login'];
                    chat.user2.email = item['u2_email'];
                }

                return chat;
            });

        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            console.error(err);
        }

        res.status(200).send({chats: chats}); 
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

            chat.user1 = await getRepository(User).findOne(POST.user1Id);
            chat.user2 = await getRepository(User).findOne(POST.user2Id);

            res.status(200).send({chat: chat});
        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            console.error(err);
        }
    }

    public static async saveMessage(req: Request, res: Response): Promise<void>{
        interface POST{
            text  : string,
            userId: number,
            chatId: number,
        }

        let 
            postErrors   : Array<keyof POST>       = [],
            validateResult: Array<ValidationError> = [],
            message      : Message | undefined     = new Message(),
            POST         : POST                    = req.body;
        
        postErrors = PostModule.checkData(POST, ['text', 'userId', 'chatId']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        message.changeFields(POST);
        message.date = new Date();

        validateResult = await validate(message);

        if(validateResult.length){
            res.status(400).send({msg: 'Bad validation', errors: Parser.parseValidateError(validateResult)});
            return;
        }

        try {
            const result: InsertResult = await getRepository(Message).insert(message);
            message.id = result.identifiers[0].id;
        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            console.error(err);
        }

        res.status(200).send({msg: 'Message has been saved successfully!', message: message})
    }


    public static async getMessages(req: Request, res: Response){

        interface POST{
            take  : number;
            skip  : number;
            chatId: number;
        }

        let 
            postErrors: Array<keyof POST> = [],
            messages  : Array<Message>    = [],
            POST      : POST              = req.body;
        
        postErrors = PostModule.checkData(POST, ['take', 'skip']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try {
            messages = await getRepository(Message).createQueryBuilder()
                .where('chatId = :id', {id: POST.chatId})
                .orderBy('id', "DESC")
                .skip(POST.skip)
                .take(POST.take)
                .getMany();

        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            console.error(err);  
        }

        res.status(200).send({messages: messages});
    }


    public static routes(){
        this.router.post('/get',          this.getChat);
        this.router.post('/add',          this.createChat);
        this.router.post('/get-chats',    this.getChats);
        this.router.post('/save-message', this.saveMessage);
        this.router.post('/get-messages', this.getMessages);

        return this.router;
    }

}
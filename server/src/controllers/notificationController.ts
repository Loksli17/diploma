import {Router, Request, Response} from 'express';


import PostModule        from '../libs/post';
import ErrorMessage      from '../libs/error';
import TypeNotification  from '../models/TypeNotification';
import Notification      from '../models/Notification';
import User              from '../models/User';
import { getRepository } from 'typeorm';


export default class NotificationController{

    private static router: Router = Router();


    private static async createNotification(req: Request, res: Response){

        interface POST{
            typeId       : number,
            userSend     : User,
            userReceiveId: number,
        }

        let 
            postErrors       : Array<keyof POST>       = [],
            typesNotification: Array<TypeNotification> = [],
            notification     : Notification,
            POST             : POST                    = req.body;
        
        postErrors = PostModule.checkData(POST, ['typeId', 'userSend', 'userReceiveId']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        notification = new Notification();

        notification.userReceiveId      = POST.userReceiveId;
        notification.userSendId         = POST.userSend.id;
        notification.typeNotificationId = POST.typeId;
        notification.date               = new Date();
        notification.time               = new Date();

        try{
            typesNotification = await getRepository(TypeNotification).find();
            notification.text = Notification.createText(typesNotification[POST.typeId - 1].template, /:login/, POST.userSend.login);
            const result = await getRepository(Notification).insert(notification);
            notification.id = result.identifiers[0].id;
        }catch(err){
            console.error(err);
        }

        res.status(200).send({notification: notification});
    }


    public static async getNotifications(req: Request, res: Response){

        interface POST{
            userId: number,
            type  : string,
        }

        let 
            postErrors   : Array<keyof POST>   = [],
            whereCond    : string              = '',
            notifications: Array<Notification> = [],
            POST         : POST                = req.body;
        
        postErrors = PostModule.checkData(POST, ['userId', 'type']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        whereCond = POST.type == "send" ? "notification.userSendId = :id" : "notification.userReceiveId = :id";
        
        try {
            notifications = await getRepository(Notification).createQueryBuilder('notification')
                .where(whereCond, {id: POST.userId})
                .leftJoinAndSelect('notification.typeNotification', 'typeNotification')
                .getMany();

        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            console.error(err);
        }

        res.status(200).send({notifications: notifications});
    }

    
    public static async removeNotification(req: Request, res: Response){

        interface POST{
            id: number,
        }

        let 
            postErrors  : Array<keyof POST> = [],
            notification: Notification | undefined,
            POST        : POST              = req.body;
        
        postErrors = PostModule.checkData(POST, ['id']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try {
            notification = await getRepository(Notification).findOne(POST.id);
        }catch(err){
            console.error(err);
        }

        if(notification == undefined){
            res.status(400).send({msg: ErrorMessage.notFound('Notification')});
            return;
        }

        try {
            const res = await getRepository(Notification).remove(notification);
            console.log(res);
        }catch(err){
            console.error(err);
        }

        res.status(200).send({msg: `Notification with id: ${notification.id}`})
    }


    public static routes(){
        this.router.post('/add',               this.createNotification);
        this.router.post('/get-notifications', this.getNotifications);
        this.router.post('/delete',            this.removeNotification);

        return this.router;
    }
}
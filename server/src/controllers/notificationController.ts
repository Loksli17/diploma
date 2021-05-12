import {Router, Request, Response} from 'express';
import { getRepository, InsertResult } from 'typeorm';


import PostModule        from '../libs/post';
import ErrorMessage      from '../libs/error';
import TypeNotification  from '../models/TypeNotification';
import Notification      from '../models/Notification';
import User              from '../models/User';



export default class NotificationController{

    private static router: Router = Router();

    public static async addNotification(userSend: User, userReceiveId: number, typeId: number): Promise<Notification | undefined>{

        let
            typesNotification: Array<TypeNotification> = [],
            notification     : Notification            = new Notification();

        notification.userReceiveId      = userReceiveId;
        notification.userSendId         = userSend.id;
        notification.typeNotificationId = typeId;
        notification.date               = new Date();
        notification.time               = new Date();

        try{
            typesNotification = await getRepository(TypeNotification).find();
            notification.text = Notification.createText(typesNotification[typeId - 1].template, /:login/, userSend.login);
            const result = await getRepository(Notification).insert(notification);
            notification.id = result.identifiers[0].id;
            notification.typeNotification = typesNotification[typeId - 1];

            return notification;
        }catch(err){
            console.error(err);
        }
    }


    public static async addManyNotifications(userSend: User, userReceiveId: Array<number>, typeId: number): Promise<Array<Notification>>{
        
        let
            typesNotification: Array<TypeNotification> = [],
            notifications    : Array<Notification>     = [];

        try {
            typesNotification = await getRepository(TypeNotification).find();
        }catch(err){
            console.error(err);
        }

        if(userReceiveId == undefined){
            return [];
        }

        userReceiveId.forEach((id) => {
            let notific: Notification = new Notification;

            notific.userReceiveId      = id;
            notific.userSendId         = userSend.id;
            notific.typeNotificationId = typeId;
            notific.date               = new Date();
            notific.time               = new Date();
            notific.typeNotification   = typesNotification[typeId - 1];
            notific.text = Notification.createText(typesNotification[typeId - 1].template, /:login/, userSend.login);
            
            notifications.push(notific);
        });

        try {
            const insertResult: InsertResult = await getRepository(Notification).insert(notifications);

            notifications.map((notific, index) => {
                notific.id = insertResult.identifiers[index].id; 
                return notific;
            })
        }catch(err){
            console.error(err);
        }

        return notifications;
    }


    private static async createNotification(req: Request, res: Response){

        interface POST{
            typeId       : number,
            userSend     : User,
            userReceiveId: number,
        }

        let 
            postErrors       : Array<keyof POST> = [],
            notification     : Notification | undefined,
            POST             : POST              = req.body;
        
        postErrors = PostModule.checkData(POST, ['typeId', 'userSend', 'userReceiveId']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        notification              = await NotificationController.addNotification(POST.userSend, POST.userReceiveId, POST.typeId);
        notification!.userReceive = await getRepository(User).findOne(notification!.userReceiveId);
        notification!.userSend    = await getRepository(User).findOne(notification!.userSendId);

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
                .andWhere("typeNotificationId = 1")
                .leftJoinAndSelect('notification.typeNotification', 'typeNotification')
                .leftJoinAndSelect('notification.userSend', 'user as u1')
                .leftJoinAndSelect('notification.userReceive', 'user as u2')
                .orderBy('notification.id', 'DESC')
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
            await getRepository(Notification).remove(notification);
        }catch(err){
            console.error(err);
        }

        res.status(200).send({msg: `Notification with id: ${POST.id}`})
    }


    public static async removeNotifications(req: Request, res: Response){

        interface POST{
            ids: Array<number>;
        }

        let 
            postErrors: Array<keyof POST> = [],
            POST      : POST              = req.body;
        
        postErrors = PostModule.checkData(POST, ['ids']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }
        
        try {
            const result = await getRepository(Notification).delete(POST.ids);
            console.log(result);
        }catch(err){
            console.error(err);
        }

        res.status(200).send({msg: `Notifications have been removed`});
    }


    public static routes(){
        this.router.post('/add',               this.createNotification);
        this.router.post('/get-notifications', this.getNotifications);
        this.router.post('/delete',            this.removeNotification);
        this.router.post('/delete-many',       this.removeNotifications);

        return this.router;
    }
}
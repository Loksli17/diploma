import { getRepository } from 'typeorm';

import {Socket, Server as SocketServer} from 'socket.io';
import User         from '../models/User';
import Message      from '../models/Message';
import Notification from '../models/Notification';


export default class SocketContoller{
    
    public static io: SocketServer;

    public static connection(socket: Socket): void{

        if(socket.handshake.query.user == undefined || typeof socket.handshake.query.user != "string") return;

        let user: User = JSON.parse(socket.handshake.query.user);

        getRepository(User).findOne(user.id).then((value: User | undefined) => {
            if(value == undefined) return;
            console.log('connect', value);

            value.socketId = socket.id;
            value.status   = true;
            getRepository(User).update(value.id!, value);

            console.log(`user with id=${value.id} socket id=${value.socketId}`);

            socket.on('disconnect', (reason: string) => {
                getRepository(User).findOne(user.id).then((value: User | undefined) => {
                    if(value == undefined) return;
                    console.log('dissconnect', value);

                     //todo reconnect if user just sleeping
                    value.socketId = "";
                    value.status   = false;
                    getRepository(User).update(value.id!, value);
                    console.log(`user with id=${value.id} has been disconnect reason: ${reason}`);
                });
            });
            
            SocketContoller.route(socket);
        });
    }


    public static notification(socket: Socket): void{

        interface Data{
            userReceiveId: number;
            notification : Notification;
        }

        socket.on('notification', (data: Data) => {
            getRepository(User).findOne(data.userReceiveId).then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined) return;
                socket.to(value.socketId).emit('notification', {notification: data.notification});
            })
        });
    }


    public static manyNotifications(socket: Socket): void{

        interface Data{
            userIds      : Array<number>;
            notifications: Array<Notification>;
        }

        socket.on('manyNotifications', (data: Data) => {

            getRepository(User).createQueryBuilder()
                .whereInIds(data.userIds)
                .getMany()
                .then((value: Array<User>): void => {

                    for(let i = 0; i < value.length; i++){
                        if(value[i].socketId == null || value[i].socketId == ""){continue;}
                        socket.to(value[i].socketId!).emit('notification', {notification: data.notifications[i]});
                    }
                });
        });
    }


    public static sendMessage(socket: Socket): void{

        interface Data{
            message      : Message;
            userReceiveId: number;
            userSend     : User;
        }

        socket.on('message', (data: Data) => {
            getRepository(User).findOne(data.userReceiveId).then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined) return;
                data.message.user = data.userSend;
                socket.to(value.socketId!).emit('message', {message: data.message, user: value});
            });
           
        });
    }


    public static removeNotification(socket: Socket): void{

        interface Data{
            notification: Notification;
            msg         : string;
        }

        socket.on('removeNotification', (data: Data) => {
            getRepository(User).findOne(data.notification.userReceiveId)
            .then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined) return;
                socket.to(value.socketId).emit('removeNotification', {notification: data.notification, msg: data.msg});
            });
        });
    }


    public static answerFriendship(socket: Socket): void{

        interface Data{
            msg         : string;
            userSendId  : number;
            notification: Notification;
        }

        socket.on('answerFriendship', (data: Data) => {
            getRepository(User).findOne(data.userSendId)
            .then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined) return;
                socket.to(value.socketId).emit('answerFriendship', {msg: data.msg, notification: data.notification});
            });
        });
    }


    public static joinProject(socket: Socket): void{

        interface Data{
            userId   : number;
            projectId: number;
        }

        socket.on('joinProject', (data: Data) => {

            socket.join(`project${data.projectId}`);

            getRepository(User).findOne(data.userId)
            .then(async (value: User | undefined) => {
                if(value == undefined || value.socketId == undefined) return;

                let 
                    clients: Set<string> | undefined = this.io.sockets.adapter.rooms.get(`project${data.projectId}`),
                    users  : Array<User>             = [];

                if(clients != undefined) {
                    users = await getRepository(User).createQueryBuilder().where('socketId in (:ids)', {ids: Array.from(clients)}).getMany();
                }
  
                this.io.sockets.to(`project${data.projectId}`).emit('joinProject', {user: value, users: users, projectId: data.projectId});
            });
        });

    }

    public static leaveProject(socket: Socket){

        interface Data{
            userId   : number;
            projectId: number;
        }

        socket.on('leaveProject', (data: Data) => {
            socket.leave(`project${data.projectId}`);
            this.io.sockets.to(`project${data.projectId}`).emit('leaveProject', data);
        });
    }


    public static mouseMove(socket: Socket){

        interface Data{
            x        : number;
            y        : number;
            userId   : number;
            projectId: number;
        }

        socket.on('mouseMove', (data: Data) => {
            this.io.sockets.to(`project${data.projectId}`).emit('mouseMove', data);
        });
    }


    public static drawShape(socket: Socket){

        interface Data{
            shape    : object;
            user     : User;
            projectId: number;
        }

        socket.on('drawShape', (data: Data) => {
            this.io.sockets.to(`project${data.projectId}`).emit('drawShape', data);
        });
    }


    public static sinhronizeData(socket: Socket){
        interface Data{
            canvas   : object;
            userId   : number;
            projectId: number; 
        }
        
        socket.on('sinhronizeData', (data: Data) => {
            console.log(data);
            getRepository(User).findOne(data.userId)
            .then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined) return;
                socket.to(value.socketId).emit('sinhronizeData', {canvas: data.canvas, projectId: data.projectId});
            });
        });
    }


    public static changeCanvas(socket: Socket){

        interface Data{
            color    : string;
            height   : number;
            width    : number
            userId   : number;
            projectId: number;
        }

        socket.on('changeCanvas', (data: Data) => {
            this.io.sockets.to(`project${data.projectId}`).emit('changeCanvas', data);
        });
    }


    public static removeShape(socket: Socket){

        interface Data{
            shape    : object;
            userId   : number;
            projectId: number;
        }

        socket.on('removeShape', (data: Data) => {
            this.io.sockets.to(`project${data.projectId}`).emit('removeShape', data);
        });
    }


    public static changeShape(socket: Socket){

        interface Data{
            shape    : object;
            userId   : number;
            projectId: number;
        }

        socket.on('changeShape', (data: Data) => {
            this.io.sockets.to(`project${data.projectId}`).emit('changeShape', data);
        });
    }


    public static resetCanvas(socket: Socket){

        interface Data{
            canvas  : object;
            projectId: number;
        }

        socket.on('resetCanvas', (data: Data) => {
            this.io.sockets.to(`project${data.projectId}`).emit('resetCanvas', data);
        });
    }

    
    public static changeState(socket: Socket){
        
        interface Data{
            canvas   : object;
            userId   : number;
            projectId: number;
        }

        socket.on('changeState', (data: Data) => {
            this.io.sockets.to(`project${data.projectId}`).emit('changeState', data);
        });
    }


    public static importCanvas(socket: Socket){

        interface Data{
            canvas   : object;
            userId   : number;
            projectId: number;
        }

        socket.on('importCanvas', (data: Data) => {
            this.io.sockets.to(`project${data.projectId}`).emit('importCanvas', data);
        });
    }

    
    public static route(socket: Socket): void{
        SocketContoller.notification(socket);
        SocketContoller.sendMessage(socket);
        SocketContoller.manyNotifications(socket);
        SocketContoller.removeNotification(socket);
        SocketContoller.answerFriendship(socket);
        SocketContoller.joinProject(socket);
        SocketContoller.leaveProject(socket);
        SocketContoller.mouseMove(socket);
        SocketContoller.drawShape(socket);
        SocketContoller.sinhronizeData(socket);
        SocketContoller.changeCanvas(socket);
        SocketContoller.removeShape(socket);
        SocketContoller.changeShape(socket);
        SocketContoller.resetCanvas(socket);
        SocketContoller.changeState(socket);
        SocketContoller.importCanvas(socket);
    }
}
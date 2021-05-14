import { getRepository } from 'typeorm';

import {Socket}     from 'socket.io';
import User         from '../models/User';
import Message      from '../models/Message';
import Notification from '../models/Notification';


export default class SocketContoller{

    public static connection(socket: Socket): void{

        if(socket.handshake.query.user == undefined || typeof socket.handshake.query.user != "string"){
            return;
        }

        let user: User = JSON.parse(socket.handshake.query.user);
        user.socketId = socket.id;
        user.status   = true;
        getRepository(User).update(user.id!, user);

        console.log(`user with id=${user.id} socket id=${user.socketId}`);

        socket.on('disconnect', (reason: string) => {

            //todo reconnect if user just sleeping
            user.socketId = "";
            user.status   = false;
            getRepository(User).update(user.id!, user);
            console.log(`user with id=${user.id} has been disconnect reason: ${reason}`);
        });
        
        SocketContoller.route(socket);
        
    }


    public static notification(socket: Socket): void{

        interface Data{
            userReceiveId: number;
            notification : Notification;
        }

        socket.on('notification', (data: Data) => {
            getRepository(User).findOne(data.userReceiveId).then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined){
                    return;
                }
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
            message      : Message,
            userReceiveId: number,
            userSend     : User,
        }

        socket.on('message', (data: Data) => {
            getRepository(User).findOne(data.userReceiveId).then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined){
                    return;
                }
                data.message.user = data.userSend;
                socket.to(value.socketId!).emit('message', {message: data.message, user: value});
            });
           
        });
    }


    public static removeNotification(socket: Socket): void{

        interface Data{
            notification: Notification,
            msg         : string,
        }

        socket.on('removeNotification', (data: Data) => {
            getRepository(User).findOne(data.notification.userReceiveId)
            .then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined){
                    return;
                }
                socket.to(value.socketId).emit('removeNotification', {notification: data.notification, msg: data.msg});
            });
        })
    }


    public static route(socket: Socket): void{
        SocketContoller.notification(socket);
        SocketContoller.sendMessage(socket);
        SocketContoller.manyNotifications(socket);
        SocketContoller.removeNotification(socket);
    }
}
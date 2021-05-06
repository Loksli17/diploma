import { getRepository } from 'typeorm';

import {Socket} from 'socket.io';
import User     from '../models/User';
import Message from '../models/Message';


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

        socket.on('notification', (data: any) => {
            getRepository(User).findOne(data.userReceiveId).then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined){
                    return;
                }
                socket.to(value.socketId).emit('notification', {notification: data.notification});
            })
        });
    }

    public static sendMessage(socket: Socket): void{

        interface Data{
            message      : Message,
            userReceiveId: User
        }

        socket.on('message', (data: Data) => {
            console.log(data);
            getRepository(User).findOne(data.userReceiveId).then((value: User | undefined): void => {
                if(value == undefined || value.socketId == undefined){
                    return;
                }
                socket.to(value.socketId!).emit('message', {message: data.message, user: value});
            });
           
        });
    }


    public static route(socket: Socket): void{
        SocketContoller.notification(socket);
        SocketContoller.sendMessage(socket);
    }
}
import { getRepository } from 'typeorm';

import {Socket} from 'socket.io';
import User     from '../models/User';


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
            user.socketId = "";
            user.status   = false;
            getRepository(User).update(user.id!, user);
            console.log(`user with id=${user.id} has been disconnect reason: ${reason}`);
        });
    }

}
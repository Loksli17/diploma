import {getConnectionManager} from 'typeorm';
import config                 from '../config';
import Project                from '../models/Project';
import User                   from '../models/User';
import UserHasProject         from '../models/UserHasProject';
import UserHasUser            from '../models/UserHasUser';
import ViewStatus             from '../models/ViewStatus';
import Notification           from '../models/Notification';
import TypeNotification       from '../models/TypeNotification';
import Chat                   from '../models/Chat';
import Message                from '../models/Message';


const
    connectionManager = getConnectionManager(),
    
    connection = connectionManager.create({
        name    : 'default',
        type    : 'mysql',
        host    : 'localhost',
        port    : config.db.port,
        username: config.db.user,
        password: config.db.password,
        database: config.db.name,
        entities: [
            User, 
            Project, 
            ViewStatus, 
            UserHasProject, 
            UserHasUser, 
            Notification, 
            TypeNotification,
            Chat,
            Message
        ],
    }),

    init = async (): Promise<void> => {
        try{
            await connection.connect();
            console.log(`Connection to ${config.db.name} was successfully. User: ${config.db.user}`);
        }catch(err){
            throw new Error(err);    
        }
    };

export default init;
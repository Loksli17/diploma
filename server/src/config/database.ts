import {getConnectionManager, ConnectionManager, Connection, getConnection} from 'typeorm';
import config from '../config';

const
    connectionManager = getConnectionManager(),
    connection        = connectionManager.create({
        type    : 'mysql',
        host    : 'localhost',
        port    : config.db.port,
        username: config.db.user,
        password: config.db.password,
        database: config.db.name,
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
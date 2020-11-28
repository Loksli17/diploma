import {getConnectionManager, ConnectionManager, Connection} from 'typeorm';
import config from '../config';

const
    connectionManager = new ConnectionManager(),
    connection        = connectionManager.create({
        type    : 'mysql',
        host    : 'localhost',
        port    : config.db.port,
        username: config.db.user,
        password: config.db.password,
        database: config.db.name,
    }),
    init = async (): Promise<void> => {
        await connection.connect();
    };

init();
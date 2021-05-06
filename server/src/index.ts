import express, {Request, Response, NextFunction} from 'express';

import config                           from './config';
import Router                           from './routes';
import connectDb                        from './config/database';
import cors                             from 'cors';
import fileUpload                       from 'express-fileupload';
import {createServer, Server}           from 'http';
import {Server as socketServer, Socket} from 'socket.io';
import SocketContoller                  from './controllers/socketController';
import morgan                           from 'morgan';


export class App{
    
    private static   instance: App;
    private          app     : express.Application;
    private readonly port    : number;
    private          server  : Server;
    private          io      : socketServer;

    
    private constructor(port: number = config.app.port){
        this.app    = express();
        this.port   = port;
        this.server = createServer(this.app);
        this.io     = new socketServer(this.server, {
            cors: {
                origin: config.cors.origin,
                methods: config.cors.methods,
            }
        });

        this.createMiddlewares();
        connectDb();
        this.app.use('/', Router.routes);
        this.ioInit();

        this.app.use(this.logErrors);
        this.app.use(this.errorHandler);
    }

    public static get Instance(): App{
        return this.instance || (this.instance = new this());
    }

    public async init(){
        this.server.listen(3000, () => console.log(`Online corel was started on port: ${this.port}. Stop it now?`));
    }

    private ioInit(){
        this.io.on('connection', SocketContoller.connection);
    }

    private logErrors(err: Error, req: Request, res: Response, next: NextFunction){
        console.error(err);
        next(err);
    }

    private errorHandler(err: Error, req: Request, res: Response, next: NextFunction){
        console.error(err);
        res.status(500).send({error: err});
    }

    private createMiddlewares(){
        this.app.use(cors(
            {
                origin: config.cors.origin,
                methods: config.cors.methods,
            }
        ));
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(fileUpload());
        // this.app.use(morgan('combined'));
    }
    
}

const app = App.Instance;
app.init();
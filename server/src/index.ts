import express, {Request, Response, NextFunction} from 'express';

import config     from './config';
import Router     from './routes';
import connectDb  from './config/database';
import cors       from 'cors';
import fileUpload from 'express-fileupload';
import io         from 'socket.io';


export class App{
    
    private static   instance: App;
    private          app     : express.Application;
    private readonly port    : number;
    
    private constructor(port: number = config.app.port){
        this.app  = express();
        this.port = port;

        this.createMiddlewares();
        connectDb();
        this.app.use('/', Router.routes);

        this.app.use(this.logErrors);
        this.app.use(this.errorHandler);
    }

    public static get Instance(): App{
        return this.instance || (this.instance = new this());
    }

    public async init(){
        this.app.listen(3000, () => console.log(`Online corel was started on port: ${this.port}. Stop it now?`));
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
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(fileUpload());
    }
    
}

const app = App.Instance;
app.init();
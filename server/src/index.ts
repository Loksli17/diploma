import express, {Request, Response, NextFunction} from 'express';
import config from './config';

//middlewares
// import cors from cors

//routers
import Router from './routes';


export class App{
    private static   instance: App;
    private          app     : express.Application;
    private readonly port    : number;
    private          db      : any;
    
    private constructor(port: number = config.app.port){
        this.app  = express();
        this.port = port;

        this.createMiddlewares();
        this.app.use('/', Router.routes);

        this.app.use(this.logErrors);
        this.app.use(this.errorHandler);

    }

    public static get Instance(): App{
        return this.instance || (this.instance = new this());
    }

    public init(){
        this.app.listen(3000, () => console.log(`Online corel was started on port: ${this.port}. Stop it now?`));
    }

    private logErrors(err: Error, req: Request, res: Response, next: NextFunction){
        console.error(err.stack);
        next(err);
    }

    private errorHandler(err: Error, req: Request, res: Response, next: NextFunction){
        res.send(500).send({error: err});
    }

    private createMiddlewares(){
        //middlewares write here
        // this.app.use(cors());
    }
    
}

const app = App.Instance;
app.init();
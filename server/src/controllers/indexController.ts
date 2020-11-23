import {Router, Request, Response, NextFunction} from 'express';

export default class IndexController{
    private static router: Router = Router();

    private static getIndexApi (req: Request, res: Response){
        res.send('indexApi');
    }

    public static routes(){
        this.router.all(`/`, this.getIndexApi);
        return this.router;
    }
}

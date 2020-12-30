import {Router, Request, Response, NextFunction} from 'express';

import {getRepository} from 'typeorm';
import User            from '../models/User';
import Project         from '../models/Project';


export default class IndexController{
    private static router: Router = Router();

    private static async getIndexApi (req: Request, res: Response){
        let
            users   : Array<User> = [],
            projects: Array<any>  = [];

        users = await getRepository(User).createQueryBuilder()
            .take(4)
            .skip(2)
            .getMany();

        projects = await getRepository(Project).createQueryBuilder()
            .getMany();
        
        res.send({users: users, projects: projects});
    }

    public static routes(){
        this.router.all(`/`, this.getIndexApi);
        return this.router;
    }
}

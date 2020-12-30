import {Router, Request, Response, NextFunction} from 'express';
// import {UserModel, User}       from '../models/UserModel';
// import {ProjectModel, Project} from '../models/ProjectModel';


export default class IndexController{
    private static router: Router = Router();

    private static async getIndexApi (req: Request, res: Response){
        let
            users   : Array<any> = [],
            projects: Array<any> = [];
        
        res.send({users: users, projects: projects});
    }

    public static routes(){
        this.router.all(`/`, this.getIndexApi);
        return this.router;
    }
}

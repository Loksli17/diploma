import {Router, Request, Response} from 'express';

import {getRepository} from 'typeorm';
import Project         from '../models/Project';

export default class ProjectController{

    private static router: Router = Router();

    private static async getProjectsApi(req: Request, res: Response){
        
        interface POST{
            take: number;
            skip: number;
        }

        let 
            POST     : POST            = req.body,
            projects: Array<Project> = [];

        if(POST.take == undefined){
            res.status(500).send({error: 'Data about take has not sended'});
            return;
        }

        if(POST.skip == undefined){
            res.status(500).send({error: 'Data about skip has not sended'});
            return;
        }

        try{
            projects = await getRepository(Project).createQueryBuilder()
                .where('authorId = :id', {id: 1})
                .skip(POST.skip)
                .take(POST.take)
                .orderBy('Project.id', 'DESC')
                .getMany();
        }catch(err){
            throw new Error(err);
        }

        res.status(200).send({projects: projects});
    }


    public static routes(){
        this.router.all('/get-projects' , this.getProjectsApi);
        return this.router;
    }
}
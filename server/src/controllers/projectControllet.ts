import {Router, Request, Response} from 'express';

import {getRepository, QueryBuilder} from 'typeorm';
import Project         from '../models/Project';
import ErrorMessage    from '../libs/error';


export default class ProjectController{

    private static router: Router = Router();

    private static async getProjects(req: Request, res: Response){
        
        interface POST{
            take  : number;
            skip  : number;
            userId: number;
            filter: number | boolean;
        }

        let 
            where   : string         = "true",
            POST    : POST           = req.body,
            projects: Array<Project> = [];

        console.log(POST);

        if(POST.take == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('take')});
            return;
        }

        if(POST.skip == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('skip')});
            return;
        }

        if(POST.userId == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('userId')});
            return;
        }

        if(POST.filter == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('filter')});
            return;
        }

        if(POST.filter !== true){
            where = "authorId = :id";
        }

        try{
            projects = await getRepository(Project).createQueryBuilder('project')
                .where(where, {id: POST.userId})
                .leftJoin('user_has_project', 'uhp', 'uhp.userId = :id', {id: POST.userId})
                .leftJoinAndSelect("project.author", "user")
                .skip(POST.skip)
                .take(POST.take)
                .orderBy('project.dateOfEdit', 'DESC')
                .getMany();
        }catch(err){
            res.status(400).send({error: 'Error with DB'});
            throw new Error(err);
        }

        res.status(200).send({projects: projects});
    }

    
    public static async getAmountProjects(req: Request, res: Response){

        interface POST{
            take  : number;
            skip  : number;
            userId: number;
            filter: number | boolean;
        }

        let 
            where: string = "true",
            POST : POST   = req.body,
            count: number = 0;

        if(POST.take == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('take')});
            return;
        }

        if(POST.skip == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('skip')});
            return;
        }

        if(POST.userId == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('userId')});
            return;
        }

        if(POST.filter == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('filter')});
            return;
        }

        if(POST.filter !== true){
            where = "authorId = :id";
        }

        try{
            count = await getRepository(Project).createQueryBuilder('project')
                .where(where, {id: POST.userId})
                .leftJoin('user_has_project', 'uhp', 'uhp.userId = :id', {id: POST.userId})
                .leftJoinAndSelect("project.author", "user")
                .skip(POST.skip)
                .take(POST.take)
                .orderBy('project.dateOfEdit', 'DESC')
                .getCount();
        }catch(err){
            res.status(400).send({error: 'Error with DB'});
            throw new Error(err);
        }

        res.status(200).send({amount: count});
    }


    public static routes(){
        this.router.all('/get-projects' ,    this.getProjects);
        this.router.all('/get-amount-projects' , this.getAmountProjects);
        return this.router;
    }
}
import {Router, Request, Response} from 'express';

import {getRepository} from 'typeorm';
import Project         from '../models/Project';
import User            from '../models/User';
import ErrorMessage    from '../libs/error';
import PostModule      from '../libs/post';
import ViewStatus      from '../models/ViewStatus';


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
            postErrors: Array<keyof POST> = [],
            where     : string            = "true",
            POST      : POST              = req.body,
            projects  : Array<Project>    = [];
        
        postErrors = PostModule.checkData(POST, ['take', 'filter', 'skip', 'userId']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
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
                .leftJoinAndSelect("project.viewStatus", "viewStatus")
                .skip(POST.skip)
                .take(POST.take)
                .orderBy('project.dateOfEdit', 'DESC')
                .getMany();
        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
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
            postErrors: Array<keyof POST> = [],
            where     : string            = "true",
            POST      : POST              = req.body,
            count     : number            = 0;

        postErrors = PostModule.checkData(POST, ['take', 'filter', 'skip', 'userId']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
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
            res.status(400).send({error: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({amount: count});
    }

    
    public static async searchProject(req: Request, res: Response){
        
        interface POST{
            searchData: string;
            userId    : number,
        }

        let
            postErrors: Array<keyof POST> = [],
            projects  : Array<Project>    = [],
            POST      : POST              = req.body;
        
        postErrors = PostModule.checkData<POST>(POST, ['searchData', 'userId']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try{
            projects = await getRepository(Project).createQueryBuilder('project')
                .where('name like :name', {name: `%${POST.searchData}%`})
                .leftJoin('user_has_project', 'uhp', 'uhp.userId = :id', {id: POST.userId})
                .leftJoinAndSelect("project.author", "user")
                .getMany();
        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({projects: projects});
    }


    public static async getCollaborators(req: Request, res: Response){

        interface POST{
            id: number;
        }

        let
            postErrors   : Array<keyof POST> = [],
            POST         : POST = req.body,
            collaborators: Array<User> = [],
            project      : Project | undefined;

        postErrors = PostModule.checkData<POST>(POST, ['id']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
        }

        try{
            project = await getRepository(Project).findOne(POST.id);
        }catch(err){
            throw new Error(err);
        }

        if(project == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('project')});
            return;
        }

        console.log(POST);

        try{
            collaborators = await getRepository(User).createQueryBuilder('user')
                .innerJoin('user_has_project', 'uhp', 'uhp.projectId = :id and uhp.userId = user.id', {id: POST.id})
                .getMany();
        }catch(err){
            throw new Error(err);
        }

        res.status(200).send({collaborators: collaborators});
    }


    public static async getStatus(req: Request, res: Response){

        let viewStatusElements: Array<ViewStatus> = [];

        try {
            viewStatusElements = await getRepository(ViewStatus).find();   
        }catch(err){
            throw new Error(err);
        }
        
        res.status(200).send({viewStatusElements: viewStatusElements});
    }

    public static async editProject(req: Request, res: Response){

        interface POST{
            project: {
                id        : number;
                name      : string;
                viewStatus: number;
            }, 
        }

        let
            postErrors: Array<keyof POST> = [],
            POST      : POST = req.body,
            project   : Project | undefined;

        postErrors = PostModule.checkData<POST>(POST, ['project']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
        }

        POST.project.id = Number(POST.project.id);
        console.log(POST);

        try {
            project = await getRepository(Project).findOne(POST.project.id);  
        }catch(err){
            throw new Error(err);
        }

        if(project == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('project')});
            return;
        }
        
        project.changeFields(POST.project);

        try{
            await getRepository(Project).update(project!.id, project);
        }catch(err){
            throw new Error(err);
        }

        project = await getRepository(Project).findOne(POST.project.id);

        res.status(200).send({project: project, msg: 'Project has changed successfully'});
    }

    public static routes(){
        this.router.all('/get-projects' ,       this.getProjects);
        this.router.all('/get-amount-projects', this.getAmountProjects);
        this.router.all('/search-project',      this.searchProject);
        this.router.all('/get-collaborators',   this.getCollaborators);
        this.router.all('/get-view-status',     this.getStatus);
        this.router.all('/edit',                this.editProject);
        return this.router;
    }
}
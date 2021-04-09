import {Router, Request, Response} from 'express';

import {Any, FindOperator, getRepository, InsertResult}             from 'typeorm';
import Project                     from '../models/Project';
import User                        from '../models/User';
import ErrorMessage                from '../libs/error';
import PostModule                  from '../libs/post';
import ViewStatus                  from '../models/ViewStatus';
import {validate, ValidationError} from 'class-validator';
import Parser                      from '../libs/parser';
import { brotliDecompressSync } from 'zlib';
import UserHasProject from '../models/UserHasProject';


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

    
    private static async getAmountProjects(req: Request, res: Response){

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

    
    private static async searchProject(req: Request, res: Response){
        
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


    private static async getCollaborators(req: Request, res: Response){

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
            res.status(400).send({msg: ErrorMessage.db()});
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
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({collaborators: collaborators});
    }


    private static async getStatus(req: Request, res: Response){

        let viewStatusElements: Array<ViewStatus> = [];

        try {
            viewStatusElements = await getRepository(ViewStatus).find();   
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }
        
        res.status(200).send({viewStatusElements: viewStatusElements});
    }


    private static async addProject(req: Request, res: Response){

        interface POST{
            project: {
                name        : string;
                viewStatusId: number;
                authorId    : number;
                dateOfEdit  : Date;
                dateOfCreate: Date;
            }
        }

        let
            postErrors    : Array<keyof POST> = [],
            POST          : POST = req.body,
            validateResult: Array<ValidationError>,
            project       : Project | undefined;
            
        postErrors = PostModule.checkData<POST>(POST, ['project']);

        if(postErrors.length){
            res.status(400).send({msg: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }
        
        POST.project!.dateOfEdit   = new Date();
        POST.project!.dateOfCreate = new Date();

        project = new Project(POST.project);

        validateResult = await validate(project);

        if(validateResult.length){
            res.status(400).send({msg: 'Bad validation', errors: Parser.parseValidateError(validateResult)});
            return;
        }

        try{
            await getRepository(Project).insert(project);
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(201).send({project: project, msg: 'Project has created successfully'});
    }


    private static async editProject(req: Request, res: Response){

        interface POST{
            project: {
                id          : number | undefined;
                name        : string;
                viewStatusid: number;
            } 
        }

        let
            postErrors: Array<keyof POST> = [],
            POST      : POST = req.body,
            project   : Project | undefined;

        postErrors = PostModule.checkData<POST>(POST, ['project']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        POST.project.id = Number(POST.project.id);

        try {
            project = await getRepository(Project).findOne(POST.project.id);  
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        if(project == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('project')});
            return;
        }
        
        project.changeFields(POST.project);

        console.log(project);

        try{
            await getRepository(Project).update(project.id!, project);
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        project = await getRepository(Project).findOne(POST.project.id);

        res.status(201).send({project: project, msg: 'Project has changed successfully'});
    }


    private static async removeProject(req: Request, res: Response){

        interface POST{
            id: number;
        }

        let 
            POST      : POST              = req.body,
            postErrors: Array<keyof POST> = [], 
            project   : Project | undefined;

        postErrors = PostModule.checkData<POST>(POST, ['id']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try {
            project = await getRepository(Project).findOne(POST.id);  
        }catch(err){
            throw new Error(err);
        }

        if(project == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('project')});
            return;
        }

        try{
            await getRepository(Project).delete(POST.id);
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({msg: `Project with name: ${project.name} has deleted successfully`});
    }


    private static async addCollaborators(req: Request, res: Response){

        interface POST{
            usersIds: Array<number>,
            id      : number
        }

        let 
            POST          : POST                  = req.body,
            postErrors    : Array<keyof POST>     = [], 
            userHasProject: Array<UserHasProject> = [];

        postErrors = PostModule.checkData<POST>(POST, ['id', 'usersIds']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        for(let i: number = 0; i < POST.usersIds.length; i++){
            userHasProject.push(new UserHasProject({projectId: POST.id, userId: POST.usersIds[i]}));
        };

        try {
            let result: InsertResult = await getRepository(UserHasProject).insert(userHasProject);
            console.log(result);
        }catch(err) {
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({msg: 'Collaborators were added'});
    }


    //TODO notificatons to another about removed
    public static async removeCollaborator(req: Request, res: Response){
        
        interface POST{
            userId   : number;
            projectId: number;
        }

        let
            POST          : POST              = req.body,
            postErrors    : Array<keyof POST> = [], 
            user          : User | undefined,
            userHasProject: Array<UserHasProject>,
            project       : Project | undefined;

        postErrors = PostModule.checkData<POST>(POST, ['userId', 'projectId']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try {
            project = await getRepository(Project).findOne(POST.projectId);

            if(project == undefined){
                res.status(400).send({msg: ErrorMessage.notFound('project')});
                return;
            }

            user = await getRepository(User).findOne(POST.userId);
            
            if(user == undefined){
                res.status(400).send({msg: ErrorMessage.notFound('user')});
                return;
            }
        }catch(err){
            throw new Error(err);   
        }

        userHasProject = await getRepository(UserHasProject).find({where: {userId: user.id, projectId: project.id}});

        try{
            await getRepository(UserHasProject).remove(userHasProject[0]);
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({msg: `Collabortor with login: ${user.login} was removed from project: ${project.name}`});
    }

    public static routes(){
        this.router.all('/get-projects' ,       this.getProjects);
        this.router.all('/get-amount-projects', this.getAmountProjects);
        this.router.all('/search-project',      this.searchProject);
        this.router.all('/get-collaborators',   this.getCollaborators);
        this.router.all('/get-view-status',     this.getStatus);
        this.router.all('/add',                 this.addProject);
        this.router.all('/edit',                this.editProject);
        this.router.all('/delete',              this.removeProject);
        this.router.all('/add-collaborators',   this.addCollaborators);
        this.router.all('/remove-collaborator', this.removeCollaborator);
        return this.router;
    }
}
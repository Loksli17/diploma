import {Router, Request, Response} from 'express';
import {Brackets, Db, getRepository}   from 'typeorm';


import Project                     from '../models/Project';
import User                        from '../models/User';
import ErrorMessage                from '../libs/error';
import PostModule                  from '../libs/post';
import ViewStatus                  from '../models/ViewStatus';
import {validate, ValidationError} from 'class-validator';
import Parser                      from '../libs/parser';
import UserHasProject              from '../models/UserHasProject';
import Notification                from '../models/Notification';
import NotificationController      from './notificationController';
import fs                          from 'fs';



export default class ProjectController{

    private static router: Router = Router();


    private static async getProjects(req: Request, res: Response){
        
        interface POST{
            take      : number;
            skip      : number;
            userId    : number;
            filter    : number | boolean;
            publicOnly: boolean;
        }

        let 
            postErrors : Array<keyof POST> = [],
            where      : string            = "true",
            publicWhere: string            = "true",
            POST       : POST              = req.body,
            projects   : Array<Project>    = [];
        
        postErrors = PostModule.checkData(POST, ['take', 'filter', 'skip', 'userId', 'publicOnly']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        if(POST.filter !== true){
            where = "project.authorId = :id";
        }

        if(POST.publicOnly){
            publicWhere = "project.viewStatusId = 1";
        }

        try{
            projects = await getRepository(Project).createQueryBuilder('project')
                .where(where, {id: POST.userId})
                .andWhere(publicWhere)
                .andWhere(new Brackets(qb => {
                    qb.where("uhp.userId = :id", {id: POST.userId})
                    .orWhere("project.authorId = :id", {id: POST.userId})
                }))
                .leftJoin('user_has_project', 'uhp', 'uhp.projectId = project.id')
                .leftJoinAndSelect("project.author", "user")
                .leftJoinAndSelect("project.viewStatus", "viewStatus")
                .skip(POST.skip)
                .take(POST.take)
                .orderBy('project.dateOfEdit', 'DESC')
                .getMany();

            projects = Project.mapOwnProjects(projects, POST.userId);

        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({projects: projects});
    }

    
    private static async getAmountProjects(req: Request, res: Response){

        interface POST{
            userId    : number;
            filter    : number | boolean;
            publicOnly: boolean;
        }

        let 
            postErrors  : Array<keyof POST> = [],
            where       : string            = "true",
            publicWhere: string            = "true",
            POST        : POST              = req.body,
            count       : number            = 0;

        postErrors = PostModule.checkData(POST, ['filter', 'userId', 'publicOnly']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        if(POST.filter !== true){
            where = "authorId = :id";
        }

        if(POST.publicOnly){
            publicWhere = "project.viewStatusId = 1";
        }

        try{
            count = await getRepository(Project).createQueryBuilder('project')
                .where(where, {id: POST.userId})
                .andWhere(publicWhere)
                .andWhere(new Brackets(qb => {
                    qb.where("uhp.userId = :id", {id: POST.userId})
                    .orWhere("project.authorId = :id", {id: POST.userId})
                }))
                .leftJoin('user_has_project', 'uhp', 'uhp.projectId = project.id')
                .leftJoinAndSelect("project.author", "user")
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
                .where('project.name like :name', {name: `%${POST.searchData}%`})
                .andWhere(new Brackets(qb => {
                    qb.where("uhp.userId = :id", {id: POST.userId})
                    .orWhere("project.authorId = :id", {id: POST.userId})
                }))
                .leftJoin('user_has_project', 'uhp', 'uhp.projectId = project.id')
                .leftJoinAndSelect("project.author", "user")
                .leftJoinAndSelect("project.viewStatus", "viewStatus")
                .getMany();

            projects = Project.mapOwnProjects(projects, POST.userId);
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
        //TODO name of project with userId, project name + smth random? (think about it)

        project = new Project();
        project.changeFields(POST.project);

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

        try{
            await getRepository(Project).update(project.id!, project);
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        project = await getRepository(Project).createQueryBuilder('project')
            .where("project.id = :id", {id: project.id})
            .leftJoinAndSelect("project.author", "user")
            .leftJoinAndSelect("project.viewStatus", "viewStatus")
            .getOne();


        res.status(201).json({project: project, msg: 'Project has changed successfully'});
    }


    //TODO: remove UserHasProject with id of project
    private static async removeProject(req: Request, res: Response){

        interface POST{
            id      : number;
            userSend: User,
        }

        let 
            POST          : POST                  = req.body,
            notifications : Array<Notification>   = [],
            userHasProject: Array<UserHasProject> = [],
            postErrors    : Array<keyof POST>     = [],
            userIds       : Array<number>         = [],
            project       : Project | undefined;

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
            userHasProject = await getRepository(UserHasProject).createQueryBuilder()
                .where("projectId = :id", {id: POST.id})
                .getMany();

            await getRepository(UserHasProject).remove(userHasProject);
            await getRepository(Project).delete(POST.id);

            userIds = userHasProject.map((item) => {return item.userId});

            notifications = await NotificationController.addManyNotifications(POST.userSend, userIds, 5);
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({msg: `Project with name: ${project.name} has deleted successfully`, notifications: notifications, userIds: userIds});
    }


    private static async addCollaborators(req: Request, res: Response){

        interface POST{
            usersIds: Array<number>,
            id      : number,
            userSend: User,
        }

        let 
            POST          : POST                     = req.body,
            postErrors    : Array<keyof POST>        = [],
            notifications : Array<Notification>      = [],
            userHasProject: Array<UserHasProject>    = [];

        postErrors = PostModule.checkData<POST>(POST, ['id', 'usersIds', 'userSend']);
        
        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        for(let i: number = 0; i < POST.usersIds.length; i++){
            userHasProject.push(new UserHasProject({projectId: POST.id, userId: POST.usersIds[i]}));
        };

        try {
            await getRepository(UserHasProject).insert(userHasProject);
            notifications = await NotificationController.addManyNotifications(POST.userSend, POST.usersIds, 3);
        }catch(err) {
            res.status(400).send({msg: ErrorMessage.db()});
            console.error(err);
        }

        res.status(200).send({msg: 'Collaborators were added', notifications: notifications});
    }


    public static async removeCollaborator(req: Request, res: Response){
        
        interface POST{
            userId   : number;
            projectId: number;
            userSend : User;
        }

        let
            POST          : POST              = req.body,
            postErrors    : Array<keyof POST> = [], 
            user          : User | undefined,
            userHasProject: Array<UserHasProject>,
            notification  : Notification | undefined,
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
            notification = await NotificationController.addNotification(POST.userSend, POST.userId, 4);
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({msg: `Collabortor with login: ${user.login} was removed from project: ${project.name}`, notification: notification});
    }


    public static async getProjectById(req: Request, res: Response){

        interface POST{
            id: number,
        }

        let
            POST      : POST               = req.body,
            postErrors: Array<keyof POST>  = [],
            canvas    : object | undefined = {},
            project   : Project | undefined;

        postErrors = PostModule.checkData<POST>(POST, ['id']);


        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try {
            project = await getRepository(Project).createQueryBuilder('project')
                .where('project.id = :id', {id: POST.id})
                .leftJoinAndSelect('project.users', 'user as u1')
                .leftJoinAndSelect('project.author', 'user as u2')
                .getOne();
                
        }catch(err){
            console.error(err);
            res.status(400).send({msg: ErrorMessage.db()});
            return;  
        }

        if(project == undefined){
            res.status(400).send({msg: ErrorMessage.notFound('project')});
            return;
        }

        try {
            canvas = JSON.parse(fs.readFileSync(`projects/${project.fileName}`, 'utf8'));
        }catch(err){
            canvas = undefined;
            console.error(err);
        }

        res.status(200).send({project: project, canvas: canvas});
    }


    public static async saveFile(req: Request, res: Response){
        
        interface POST{
            canvas: object,
            id    : number,
        }

        let
            POST      : POST              = req.body,
            postErrors: Array<keyof POST> = [], 
            project   : Project | undefined;

        postErrors = PostModule.checkData<POST>(POST, ['canvas', 'id']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try {
            project = await getRepository(Project).findOne(POST.id);
        }catch(err){
            console.error(err);
            res.status(400).send({msg: ErrorMessage.db()});
            return;
        }
        
        if(project == undefined){
            res.status(400).send({msg: ErrorMessage.notFound('project')});
            return;
        }

        console.log(POST.canvas);

        try {
            fs.writeFileSync(`projects/project${POST.id}.json`, JSON.stringify(POST.canvas));
        }catch(err){
            console.error(err);
            res.status(400).send({msg: ErrorMessage.file()});
            return;
        }
        
        project.fileName = `project${POST.id}.json`;

        try {
            await getRepository(Project).update(POST.id, project);
        }catch(err){
            console.error(err);
            res.status(400).send({msg: ErrorMessage.db()});
            return;
        }

        res.status(200).send({msg: 'File has been saved successfully'});
    }


    private static async checkAccess(req: Request, res: Response){

        interface POST{
            projectId: object,
            userId   : number,
        }

        let
            POST      : POST              = req.body,
            postErrors: Array<keyof POST> = [], 
            project   : Project | undefined;

        postErrors = PostModule.checkData<POST>(POST, ['projectId', 'userId']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        project = await getRepository(Project).createQueryBuilder('project')
            .leftJoinAndSelect('user_has_project', 'uhp', 'uhp.projectId = project.id')
            .where('project.id = :projectId', {projectId: POST.projectId})
            .andWhere(new Brackets(qb => {
                qb.where("uhp.userId = :userId", {userId: POST.userId})
                .orWhere("project.authorId = :userId", {userId: POST.userId})
            }))
            .getOne();

        res.status(200).send({access: project == undefined ? false : true});
    }


    public static routes(){
        this.router.post('/get-projects' ,       this.getProjects);
        this.router.post('/get-amount-projects', this.getAmountProjects);
        this.router.post('/search-project',      this.searchProject);
        this.router.post('/get-collaborators',   this.getCollaborators);
        this.router.post('/get-view-status',     this.getStatus);
        this.router.post('/add',                 this.addProject);
        this.router.post('/edit',                this.editProject);
        this.router.post('/delete',              this.removeProject);
        this.router.post('/add-collaborators',   this.addCollaborators);
        this.router.post('/remove-collaborator', this.removeCollaborator);
        this.router.post('/get-project',         this.getProjectById);
        this.router.post('/save-file',           this.saveFile);
        this.router.post('/check-access',        this.checkAccess);

        return this.router;
    }
}
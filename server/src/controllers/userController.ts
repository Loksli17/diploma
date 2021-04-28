import {Router, Request, Response} from 'express';

import {validate, ValidationError} from 'class-validator';
import {FileArray, UploadedFile}   from 'express-fileupload';
import ErrorMessage                from '../libs/error'; 
import {getRepository, Brackets}   from 'typeorm';
import Parser                      from '../libs/parser';
import User                        from '../models/User';
import fs                          from 'fs';
import crypto                      from 'crypto-js';
import PostModule                  from '../libs/post';
import UserHasUser from '../models/UserHasUser';


export default class UserController{

    private static router: Router = Router();

    private static async getFriends(req: Request, res: Response){
        
        interface POST{
            take: number;
            skip: number;
            id  : number,
        }

        let
            postErrors: Array<keyof POST>  = [],
            POST      : POST               = req.body,
            friends   : Array<User> = [];

        postErrors = PostModule.checkData(POST, ['take', 'skip', 'id']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try{
            friends = await getRepository(User).createQueryBuilder('user')
                .innerJoin('user_has_user', 'uhu', 'uhu.userId1 = user.id or uhu.userId2 = user.id')
                .where('(uhu.userId1 = :id || uhu.userId2 = :id) and user.id != :id', {id: POST.id})
                .skip(POST.skip)
                .take(POST.take)
                .orderBy('user.status')
                .getMany();

        }catch(err){
            throw new Error(err);
        }

        res.status(200).send({friends: friends});
    }

    
    private static async searchUser(req: Request, res: Response){

        interface POST{
            login?: string;
            id   ?: number;
            email?: string;
        }

        // TODO DON'T FORGET ABOUT LIKE
        let 
            POST      : POST              = req.body,
            postErrors: Array<keyof POST> = [],
            users     : Array<User>       = [];
            
        users = await getRepository(User).createQueryBuilder()
                .where('user.login = :login', {login: POST.login})
                .getMany();

        res.status(200).send({users: users});
    }


    private static async searchCollaborators(req: Request, res: Response){
        interface POST{
            searchData: string;
            collabsIds: Array<number>,
        }

        let 
            POST      : POST              = req.body,
            postErrors: Array<keyof POST> = [],
            users     : Array<User>       = [];

        postErrors = PostModule.checkData<POST>(POST, ['searchData', 'collabsIds']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }


        try{
            users = await getRepository(User).createQueryBuilder()
                .where('id not in (:...ids)', {ids: POST.collabsIds})
                .andWhere(new Brackets(qb => {
                    qb.where('email like :data', {data: `%${POST.searchData}%`})
                    .orWhere('login like :data', {data: `%${POST.searchData}%`})
                }))
                .getMany();
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({users: users});
    }


    private static async getById(req: Request, res: Response){

        interface POST{
            id: number;
        }

        let
            postErrors: Array<keyof POST> = [],
            POST      : POST              = req.body,
            user      : User | undefined  = undefined;

        postErrors = PostModule.checkData(POST, ['id']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try {
            user = await getRepository(User).findOne(POST.id);
        }catch(err) {
            res.status(400).send({error: 'Error with DB'});
            throw new Error(err);
        }

        if(user == undefined){
            res.status(200).send({msg: ErrorMessage.notFound('user')});
            return;
        }

        res.status(200).send({user: user});
    }


    //!FIX POST ERRORS
    private static async editUser(req: Request, res: Response){

        interface POST{
            user: {
                id       : number;
                login    : string;
                email    : string;
                firstName: string;
                lastName : string;
            }
        }

        let 
            user          : User | undefined,
            validateResult: Array<ValidationError>,
            POST          : POST = req.body;

        if(POST.user == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('user')});
            return;
        }

        try {
            user = await getRepository(User).findOne(POST.user.id);
        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            throw new Error(err);
        }
        
        if(user == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('user')});
            return;
        }

        user = new User();
        user.changeFields(POST.user);

        validateResult = await validate(user);

        if(validateResult.length){
            res.status(400).send({msg: 'Bad validation', errors: Parser.parseValidateError(validateResult)});
            return;
        }

        try{
            await getRepository(User).update(user.id!, user);
        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(201).send({msg: `Data about You has chanded successfully`, user: user});
    }


    //!FIX POST ERRORS
    private static async editAvatar(req: Request, res: Response){

        interface POST{
            userId: number;
        }

        let
            oldFileName : string,
            fullFileName: string,
            user        : User | undefined,
            POST        : POST                  = req.body,
            files       : FileArray | undefined = req.files;

        if(files == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('file')});
            return;
        }

        if(POST.userId == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('user')});
            return;
        }

        try {
            user = await getRepository(User).findOne(POST.userId);
        }catch(err){
            
        }
        
        if(user == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('user')});
            return;
        }

        oldFileName = user.avatar!;

        for (const key in files){
            if (Object.prototype.hasOwnProperty.call(files, key)) {
                const file: UploadedFile | Array<UploadedFile> = files[key];

                if(Array.isArray(file)){
                    res.status(400).send({error: ErrorMessage.dataNotSended('file')});
                    return;
                }

                try{
                    fullFileName = Parser.parseFileName(file, POST.userId);
                    if(fullFileName == oldFileName) break;
                    file.mv(`../client/public/${fullFileName}`);
                    user.avatar = fullFileName;
                }catch(err){
                    res.status(400).send({error: 'Error with file moving'});
                    throw new Error(err);
                }
                
            }
        }

        //!deleting old avatar
        if(oldFileName != user.avatar && fs.existsSync(`../client/public/${oldFileName}`)){
            try{
                fs.unlinkSync(`../client/public/${oldFileName}`);
            }catch(err){
                res.status(400).send({error: 'Error with unlik old avatar'});
                throw new Error(err);
            }
        }
        
        try{
            await getRepository(User).update(user.id!, user);
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        res.status(200).send({msg: 'File has uploaded successfully', user: user});
    }


    private static async editPassword(req: Request, res: Response){

        interface POST{
            old: string;
            new: string;
            id : number;
        }

        let
            user  : User | undefined,
            errors: Array<{msg: string; name: string}> = [],
            POST  : POST = req.body;

        if(POST.old == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('old password')});
            return;
        }

        if(POST.new == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('new password')});
            return;
        }

        if(POST.id == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('user')});
            return;
        }

        //!validation
        if(POST.old.length < 7){
            errors.push({msg: `Old password must be longer than or equal to 7 characters`, name: 'old'});
        }

        if(POST.new.length < 7){
            errors.push({msg: `New password must be longer than or equal to 7 characters`, name: 'new'});
        }

        if(errors.length){
            res.status(400).send({msg: 'Bad validation', errors: errors});
            return;
        }

        //!query
        try{
           user = await getRepository(User).findOne(POST.id);
        }catch(err){
            res.status(400).send({error: ErrorMessage.db()});
            throw new Error(err);
        }

        if(user == undefined){
            res.status(400).send({error: ErrorMessage.notFound(`user with id = ${POST.id}`)});
            return;
        }

        if(user.password! !== crypto.SHA256(POST.old).toString()){
            res.status(400).send({msg: 'Bad validation', errors: [{name: 'old', msg: 'Old password is not correct'}]});
            return;
        }
        
        //!edit password
        user.password = crypto.SHA256(POST.new).toString();

        try {
            await getRepository(User).update(POST.id, user);  
        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

         res.status(200).send({msg: 'Your password has changed successfully', user: user});
    }


    public static async checkFriends(req: Request, res: Response){
        interface POST{
            userId1: number,
            userId2: number,
        }

        let
            postErrors      : Array<keyof POST>        = [],
            POST            : POST                     = req.body,
            friendshipStatus: number                   = 0,
            userHasUser     : UserHasUser | undefined  = undefined;

        postErrors = PostModule.checkData(POST, ['userId1', 'userId2']);

        if(postErrors.length){
            res.status(400).send({error: ErrorMessage.dataNotSended(postErrors[0])});
            return;
        }

        try{
            userHasUser = await getRepository(UserHasUser).createQueryBuilder()
                .where(
                    "(userId1 = :id1 && userId2 = :id2) || (userId1 = :id2 && userId2 = :id1)", 
                    {id1: POST.userId1, id2: POST.userId2}
                )
                .getOne();

        }catch(err){
            res.status(400).send({msg: ErrorMessage.db()});
            throw new Error(err);
        }

        console.log(userHasUser);

        res.status(200).send({msg: friendshipStatus});
    }


    public static routes(){
        this.router.post('/get-friends',          this.getFriends);
        this.router.post('/search-user',          this.searchUser);
        this.router.post('/edit',                 this.editUser);
        this.router.post('/edit-avatar',          this.editAvatar);
        this.router.post('/get-id',               this.getById);
        this.router.post('/edit-password',        this.editPassword);
        this.router.post('/search-collaborators', this.searchCollaborators);
        this.router.post('/check-friends',        this.checkFriends);
        return this.router;
    }
}
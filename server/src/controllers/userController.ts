import {Router, Request, Response} from 'express';

import {validate, ValidationError} from 'class-validator';
import {FileArray, UploadedFile}                 from 'express-fileupload';
import ErrorMessage                from '../libs/error'; 
import {getRepository}             from 'typeorm';
import Parser                      from '../libs/parser';
import User                        from '../models/User';
import fs                          from 'fs';


export default class UserController{

    private static router: Router = Router();


    private static async getFriends(req: Request, res: Response){
        
        interface POST{
            take: number;
            skip: number;
        }

        let
            POST   : POST        = req.body,
            friends: Array<User> = [];

        if(POST.take == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('take')});
            return;
        }

        if(POST.skip == undefined){
            res.status(400).send({error: ErrorMessage.dataNotSended('skip')});
            return;
        }

        try{
            friends = await getRepository(User).createQueryBuilder()
                .leftJoin('user_has_user', 'uhu', 'uhu.userId1 = :id or uhu.userId2 = :id', {id: 1})
                .where('user.id != :id', {id: 1})
                .skip(POST.skip)
                .take(POST.take)
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
            POST: POST         = req.body,
            users: Array<User> = await getRepository(User).createQueryBuilder()
                .where('user.login = :login', {login: POST.login})
                .getMany();

        res.status(200).send({users: users});
    }


    private static async getById(req: Request, res: Response){

        interface POST{
            id: number;
        }

        let 
            POST: POST = req.body,
            user: User | undefined;

        if(POST.id == undefined){
            res.status(400).send({error: 'Data about `id` has not sended'});
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

        user = await getRepository(User).findOne(POST.userId);

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


    public static routes(){
        this.router.all('/get-friends', this.getFriends);
        this.router.all('/search-user', this.searchUser);
        this.router.all('/edit',        this.editUser);
        this.router.all('/edit-avatar', this.editAvatar);
        this.router.all('/get-id',      this.getById);
        return this.router;
    }
}
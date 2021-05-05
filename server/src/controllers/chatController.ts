import {Router, Request, Response} from 'express';
import {getRepository} from 'typeorm';


import Chat              from '../models/Chat';
import ErrorMessage      from '../libs/error';

export default class ChatController{

    private static router: Router = Router();


    private static async getChat(): Promise<void>{
        interface POST{
            
        }
    }

    private static async createChat(): Promise<void>{

    }


    public static routes(){
        this.router.post('/get', this.getChat);
        this.router.post('/add', this.createChat);

        return this.router;
    }

}
import {UserModel, User} from '../models/User';
import '../config/database';

const init = async(): Promise<void> => {

    let users: Array<User> = [
        {
            email : '123@mail.ru',
            avatar: 'avatar.png',
            login : 'loksli17',
            // name  : {
            //     lastName : 'Rukavishnikov',
            //     firstName: 'Viktor', 
            // }
        },
        {
            email : '124@gmail.ru',
            avatar: 'avatar.png',
            login : 'chebaTop',
            // name  : {
            //     lastName : 'Shirokov',
            //     firstName: 'Roman', 
            // }
        },
        {
            email : '125@mail.ru',
            avatar: 'avatar.png',
            login : 'rukav229',
            // name  : {
            //     lastName : 'Dzuba',
            //     firstName: 'Artem', 
            // }
        },
        {
            email : '126@gmail.ru',
            avatar: 'avatar.png',
            login : 'rukav229',
            // name  : {
            //     lastName : 'Brus',
            //     firstName: 'Ueain', 
            // }
        },
    ],
    result: Array<User> = [];

    try{
        await UserModel.remove({});
    }catch(err){
        console.log(err);
    }

    try{
        result = await UserModel.insertMany(users);
    }catch(err){
        console.log(err);
    }

    console.log(result);
    
};

init();

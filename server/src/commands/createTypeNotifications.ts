import TypeNotification  from '../models/TypeNotification';
import connectDb         from '../config/database';
import { getRepository } from 'typeorm';

const init = async (): Promise<void> => {
    
    let types: Array<TypeNotification> = [];

    types.push(new TypeNotification());
    types[0].id       = 1;
    types[0].name     = 'Add to friendlist';
    types[0].img      = 'notification/add-friend.svg';
    types[0].template = 'User :login invited you to his friend list';

    types.push(new TypeNotification());
    types[1].id       = 2;
    types[1].name     = 'Delete from friendlist';
    types[1].img      = 'notification/delete-friend.svg';
    types[1].template = 'User :login deleted from friendlist';

    connectDb();

    try {
        await getRepository(TypeNotification).clear();  
    }catch(err){
        console.error(err);
    }

    try {
        await getRepository(TypeNotification).insert(types);
    }catch(err){
        console.error(err);   
    }

}

init();
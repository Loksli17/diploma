import {ProjectModel, Project} from '../models/ProjectModel';
import '../config/database';

const init = async(): Promise<void> => {

    let Projects: Array<Project> = [
        {
            name        : 'projectOfYourDream',
            filename    : 'kek1.json',
            dateOfCreate: new Date(),
        },
        {
            name        : 'project',
            filename    : '123.json',
            dateOfCreate: new Date(),
        },
        // {
        //     name    : 'projectOfYourRukav',
        //     filename: 'lol.json',
        //     members : [{id: '125@mail.ru', isAuthor: true}, {id: '124@mail.ru', isAuthor: false}],
        // },
        // {
        //     name    : 'projectOf',
        //     filename: 'kekandLol.json',
        //     members : [{id: '123@mail.ru', isAuthor: true}, {id: '124@mail.ru', isAuthor: false}],
        // },
        // {
        //     name    : 'projectOffff',
        //     filename: 'kekandLol.json',
        //     members : [{id: '123@mail.ru', isAuthor: true}, {id: '125@mail.ru', isAuthor: false}],
        // },
    ],
    result: Array<Project> = [];

    try{
        await ProjectModel.remove({});
    }catch(err){
        console.log(err);
    }

    try{
        result = await ProjectModel.insertMany(Projects);
    }catch(err){
        console.log(err);
    }

    console.log(result);
    
};

init();

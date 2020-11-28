import {ProjectModel, Project} from '../models/ProjectModel';
import '../config/database';

const init = async(): Promise<void> => {

    let Projects: Array<Project> = [
        {
            name    : 'projectOfYourDream',
            filename: 'kek.json',
        },
        {
            name    : 'projectOfYourDream',
            filename: 'kek.json',
        },
        {
            name    : 'projectOfYourDream',
            filename: 'kek.json',
        },
        {
            name    : 'projectOfYourDream',
            filename: 'kek.json',
        },
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

import {prop, getModelForClass} from '@typegoose/typegoose';

class Name{
    @prop({type: () => String})
    public lastName?: string;
    
    @prop({type: () => String})
    public firstName?: string;
}


class Project{

    @prop({type: () => String, required: true,})
    public name?: string;

    @prop({type: () => String, required: true,})
    public filename?: string;

}

const ProjectModel = getModelForClass(Project);

export {ProjectModel, Project};
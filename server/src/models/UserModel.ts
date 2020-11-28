import {prop, getModelForClass} from '@typegoose/typegoose';

class Name{
    @prop({type: () => String})
    public lastName?: string;
    
    @prop({type: () => String})
    public firstName?: string;
}


class User{

    @prop({type: () => String, required: true,})
    public login?: string;

    @prop({type: () => String, required: true,})
    public avatar?: string;

    @prop({type: () => String, required: true,})
    public email?: string;

    // @prop({type: () => Name})
    // public name?: Name;

}

const UserModel = getModelForClass(User);

export {UserModel, User};
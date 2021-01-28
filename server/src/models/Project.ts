import {IsEmail, MinLength}                                 from 'class-validator';
import {Entity, Column, PrimaryGeneratedColumn, ManyToMany} from 'typeorm';
import User                                                 from './User';

@Entity()
export default class Project{

    constructor(project: Partial<Project>){
        Object.assign(this, project);
    }

    public changeFields(project: Partial<Project>){
        Object.assign(this, project);
    }

    @PrimaryGeneratedColumn()
    public id: number = 1;

    @Column()
    public name: string = 'Project';

    @Column()
    public fileName: string = 'project.json';

    @Column()
    public dateOfCreate: Date = new Date();

    @Column()
    public dateOfEdit: Date = new Date();

    @ManyToMany(() => User, user => user.projects)
    users: Array<User> | undefined;
}
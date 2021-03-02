import {IsEmail, MinLength}                                 from 'class-validator';
import {Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne} from 'typeorm';
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
    public authorId: number = 1;

    @Column()
    public fileName: string = 'project.json';

    @Column()
    public image: string = 'default-img.png';

    @Column()
    public dateOfCreate: Date = new Date();

    @Column()
    public dateOfEdit: Date = new Date();

    @ManyToOne(() => User, user => user.ownProjects)
    public author?: User;

    @ManyToMany(() => User, user => user.projects)
    users: Array<User> | undefined;
}
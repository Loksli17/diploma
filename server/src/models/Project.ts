import {Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, Unique} from 'typeorm';


import {IsNotEmpty} from 'class-validator';
import User         from './User';
import ViewStatus   from './ViewStatus';
import {IsUniq}     from '@join-com/typeorm-class-validator-is-uniq';

@Entity()
export default class Project{

    public changeFields(project: Partial<Project>){
        Object.assign(this, project);
    }

    @PrimaryGeneratedColumn()
    public id?: number;

    @IsNotEmpty()
    @Column()
    public name: string = 'Project';

    @Column()
    public authorId: number = 1;

    @Column()
    public viewStatusId: number = 1;

    @IsUniq()
    @IsNotEmpty()
    @Column()
    public fileName: string = 'project.json';
    
    @Column()
    public image: string = 'default-img.png';

    @Column()
    public dateOfCreate: Date = new Date();

    @Column()
    public dateOfEdit: Date = new Date();


    @ManyToOne(() => User, user => user.ownProjects)
    public author?: User | number;

    @ManyToMany(() => User, user => user.projects)
    users: Array<User> | undefined;

    @ManyToOne(() => ViewStatus, viewStatus => viewStatus.projects)
    public viewStatus?: ViewStatus | number;


    public isOwn?: boolean;

    public static mapOwnProjects(projects: Array<Project>, userId: number){
        return projects.map((elem: Project) => {
            elem.isOwn = elem.authorId == userId ? true : false;
            return elem;
        });
    }
}
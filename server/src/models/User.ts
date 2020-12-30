import {IsEmail, MinLength} from 'class-validator';
import {Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable} from 'typeorm';
import Project from './Project';

@Entity()
export default class User{

    @PrimaryGeneratedColumn()
    public id: number = 1;

    @Column()
    public lastName: string = 'Rukav';

    @Column()
    public firstName: string = 'Lesha';

    @Column()
    public login: string = 'bestMathMan228';

    @Column()
    @IsEmail()
    public email: string = '123@mail.ru';

    @Column()
    @MinLength(7)
    public password: string = '12345678';

    @ManyToMany(() => Project, project => project.users)
    public projects: Array<Project> | undefined; 
}
import {IsEmail, MinLength, IsNotEmpty} from 'class-validator';
import {Entity, Column, PrimaryGeneratedColumn, ManyToMany, Unique} from 'typeorm';
import Project from './Project';

@Entity()
export default class User{

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column()
    @IsNotEmpty()
    public lastName: string = 'Rukav';

    @Column()
    @IsNotEmpty()
    public firstName: string = 'Lesha';

    @Column()
    @IsNotEmpty()
    public login: string = 'bestMathMan228';

    @Column()
    @IsEmail()
    @IsNotEmpty()
    public email: string = '123@mail.ru';

    @Column()
    @MinLength(7)
    @IsNotEmpty()
    public password: string = '12345678';

    @Column()
    public avatar: string = 'default-user.png';

    @ManyToMany(() => Project, project => project.users)
    public projects: Array<Project> | undefined; 
}


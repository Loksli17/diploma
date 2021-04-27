import {IsEmail, MinLength, IsNotEmpty} from 'class-validator';
import {IsUniq}                         from '@join-com/typeorm-class-validator-is-uniq';
import Project                          from './Project';
import UserHasUser                      from './UserHasUser';

import {Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany} from 'typeorm';


@Entity()
export default class User{


    public changeFields(user: Partial<User>){
        Object.assign(this, user);
    }

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

    @Column({unique: true})
    @IsEmail()
    @IsNotEmpty()
    @IsUniq()
    public email: string = '123@mail.ru';

    @Column({})
    @MinLength(7)
    @IsNotEmpty()
    public password: string = '12345678';

    @Column()
    @IsNotEmpty()
    public avatar: string = 'default-user.png';

    @Column()
    @IsNotEmpty()
    public status: boolean = false;

    @OneToMany(() => Project, project => project.author)
    public ownProjects?: Array<Project> | undefined;

    @ManyToMany(() => Project, project => project.users)
    public projects?: Array<Project> | undefined;


    public static cleanItem<T extends Object>(item: T): T{
        let userProps: Array<string> = ['id', 'firstName', 'email', 'lastName', 'password', 'status', 'login', 'avatar'];

        for(let prop in item){
            if(Object.prototype.hasOwnProperty.call(item, prop)){
                if(!userProps.includes(prop)){
                    delete item[prop];
                }
            }
        }
        
        return item;
    }
}


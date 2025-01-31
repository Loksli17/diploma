import {Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable} from 'typeorm';

import {IsEmail, MinLength, IsNotEmpty, MaxLength} from 'class-validator';
import {IsUniq}                                    from '@join-com/typeorm-class-validator-is-uniq';
import Project                                     from './Project';
import Notification                                from './Notification';
import Chat                                        from './Chat';
import Message                                     from './Message';


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

    @Column()
    @IsEmail()
    @IsNotEmpty()
    @IsUniq()
    public email: string = '123@mail.ru';

    @Column()
    @MinLength(7)
    @IsNotEmpty()
    public password: string = '12345678';

    @Column()
    @IsNotEmpty()
    public avatar: string = 'default-user.png';

    @Column()
    @IsNotEmpty()
    public status: boolean = false;

    @Column()
    public socketId?: string;


    @OneToMany(() => Project, project => project.author)
    public ownProjects?: Array<Project> | undefined;

    @ManyToMany(() => Project, project => project.users)
    @JoinTable({
        name              : "user_has_project",
        joinColumns       : [{name: 'userId'}],
        inverseJoinColumns: [{name: 'projectId'}],
    })
    public projects?: Array<Project> | undefined;


    @OneToMany(() => Notification, notification => notification.userReceive)
    public receiveNotifications?: Array<Notification> | undefined;

    @OneToMany(() => Notification, notification => notification.userSend)
    public sendNotifications?: Array<Notification> | undefined;


    @OneToMany(() => Chat, chat => chat.user1)
    public chats1?: Array<Chat> | undefined;

    @OneToMany(() => Chat, chat => chat.user1)
    public chats2?: Array<Chat> | undefined;

    @OneToMany(() => Message, message => message.user)
    public messages?: Array<Chat> | undefined;
}


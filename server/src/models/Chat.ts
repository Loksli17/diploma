import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany} from 'typeorm';

import {IsNotEmpty} from 'class-validator';
import User         from './User';
import Message      from './Message';


@Entity()
export default class Chat{

    public changeFields(chat: Partial<Chat>){
        Object.assign(this, chat);
    }

    @PrimaryGeneratedColumn()
    public id?: number;

    @IsNotEmpty()
    @Column()
    public userId1?: number;

    @IsNotEmpty()
    @Column()
    public userId2?: number;

    @ManyToOne(() => User, user => user.chats1)
    public user1?: User | number;

    @ManyToOne(() => User, user => user.chats2)
    public user2?: User | number;


    @OneToMany(() => Message, message => message.chat)
    public messages?: Array<Message> | undefined;
}
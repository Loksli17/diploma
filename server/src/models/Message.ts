import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';

import {IsNotEmpty, MaxLength} from 'class-validator';
import User                    from './User';
import Chat                    from './Chat';


@Entity()
export default class Message{

    public changeFields(message: Partial<Message>){
        Object.assign(this, message);
    }

    @PrimaryGeneratedColumn()
    public id?: number;

    @IsNotEmpty()
    @Column()
    public userId?: number;

    @IsNotEmpty()
    @Column()
    public chatId?: number;

    @IsNotEmpty()
    @MaxLength(500)
    @Column()
    public text?: string;


    @ManyToOne(() => User, user => user.messages)
    public user?: User | number;

    @ManyToOne(() => Chat, chat => chat.messages)
    public chat?: User | number;

}
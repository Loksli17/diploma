import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';

import {IsNotEmpty}     from 'class-validator';
import User             from './User';
import TypeNotification from './TypeNotification';


@Entity()
export default class Notification{

    public changeFields(Notification: Partial<Notification>){
        Object.assign(this, Notification);
    }

    @PrimaryGeneratedColumn()
    public id?: number;

    @IsNotEmpty()
    @Column()
    public text?: string;

    @IsNotEmpty()
    @Column()
    public date?: Date;

    @IsNotEmpty()
    @Column()
    public time?: Date;

    @IsNotEmpty()
    @Column()
    public userSendId?: number;

    @IsNotEmpty()
    @Column()
    public userReceiveId?: number;

    @IsNotEmpty()
    @Column()
    public typeNotificationId?: number;


    @ManyToOne(() => User, user => user.receiveNotifications)
    public userReceive?: User | number;

    @ManyToOne(() => User, user => user.sendNotifications)
    public userSend?: User | number;

    @ManyToOne(() => TypeNotification, type => type.notifications)
    public typeNotification?: TypeNotification | number;


    public static createText(text: string | undefined, reg: RegExp, data: string): string{
        if(text == undefined){
            throw new Error('text undefined in createText');
        }
        return text.replace(reg, data);
    }
}
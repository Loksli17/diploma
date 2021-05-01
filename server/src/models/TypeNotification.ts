import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';

import Notification from './Notification';

@Entity(`typenotification`)
export default class TypeNotification{

    public changeFields(typeNotification: Partial<TypeNotification>){
        Object.assign(this, typeNotification);
    }

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column()
    public name?: string;

    @Column()
    public template?: string;

    @Column()
    public img?: string;


    @OneToMany(() => Notification, notification => notification.typeNotification)
    public notifications?: Array<Notification> | undefined;
}
import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';;
import {IsNotEmpty}                                         from 'class-validator';
import User                                                 from './User';


@Entity('user_has_user')
export default class UserHasUser{

    public changeFields(user: Partial<UserHasUser>){
        Object.assign(this, user);
    }

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column()
    @IsNotEmpty()
    public userId1: number = 0;

    @Column()
    @IsNotEmpty()
    public userId2: number = 0;

}
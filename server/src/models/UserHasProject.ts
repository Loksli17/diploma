import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';;
import {IsNotEmpty}                             from 'class-validator';

@Entity('user_has_project')
export default class UserHasProject{

    constructor(userHasProject: Partial<UserHasProject>){
        Object.assign(this, userHasProject);
    }

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column()
    @IsNotEmpty()
    public userId: number = 0;

    @Column()
    @IsNotEmpty()
    public projectId: number = 0;
}
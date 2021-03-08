import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';

import {IsNotEmpty} from 'class-validator';
import {IsUniq}     from '@join-com/typeorm-class-validator-is-uniq';
import Project      from './Project';


@Entity('viewstatus')
export default class ViewStatus{

    constructor(viewStatus: Partial<ViewStatus>){
        Object.assign(this, viewStatus);
    }

    public changeFields(viewStatus: Partial<ViewStatus>){
        Object.assign(this, viewStatus);
    }

    @PrimaryGeneratedColumn()
    public id: number = 1;

    @Column()
    @IsNotEmpty()
    @IsUniq()
    public name: string = 'Public';

    @OneToMany(() => Project, project => project.viewStatus)
    public projects?: Array<Project> | undefined;
}
import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';


@Entity()
export default class Notification{

    public changeFields(project: Partial<Notification>){
        Object.assign(this, project);
    }

    @PrimaryGeneratedColumn()
    public id?: number;

    @Column()
    public text?: string;

    @Column()
    public date?: string;
}
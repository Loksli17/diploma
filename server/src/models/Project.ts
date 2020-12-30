import {IsEmail, MinLength} from 'class-validator';
import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export default class Project{

    @PrimaryGeneratedColumn()
    public id: number = 1;

    @Column()
    public name: string = 'Project';

    @Column()
    public fileName: string = 'project.json';

    @Column()
    public dateOfCreate: Date = new Date();

    @Column()
    public dateOfEdit: Date = new Date();

    @Column()
    public authorId: number = 1;
}
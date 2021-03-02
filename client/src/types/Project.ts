import './User';
import User from './User';

export default interface Project{
    id: number;
    name: string;
    authorId?: number;
    fileName?: string;
    dateOfCreate?: Date | string;
    dateOfEdit: Date | string;
    author?: User;
    image: string;
}
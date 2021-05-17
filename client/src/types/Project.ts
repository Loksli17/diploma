import User       from './User';
import ViewStatus from './ViewStatus';

export default interface Project{
    id: number;
    name: string;
    authorId?: number;
    fileName?: string;
    dateOfCreate?: Date | string;
    dateOfEdit: Date | string;
    viewStatus: ViewStatus;
    author?: User;
    image: string;
    isOwn?: boolean;


    users?: Array<User>;
}
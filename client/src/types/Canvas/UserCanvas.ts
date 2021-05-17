import User from '../User';

export default interface UserCanvas extends User{
    color?: string;
    cursor?: {x: number; y: number}; 
}
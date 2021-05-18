import User from '../types/User';

export default interface UserCanvas extends User{
    color? : string;
    cursor?: {x: number; y: number}; 
}
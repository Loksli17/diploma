import User from './User';

export default interface Notification{
    id?: number;
    text: string;
    date: Date,
    time: Date,

    userRecieveId?: number,
    userRecieve?: User,
    
    userSendId?: number,
    userSend?: User,
    
    typeNotificationId?: number,
}
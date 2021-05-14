import User from './User';

export default interface Notification{
    id?: number;
    text: string;
    date: Date,
    time: Date,

    userReceiveId?: number,
    userReceive?: User,
    
    userSendId?: number,
    userSend?: User,
    
    typeNotificationId?: number,
}
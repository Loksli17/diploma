import User from './User';
import Chat from './Chat';


export default interface Message{
    id?: number;

    text: string;
    userId: number;
    chatId: number;

    user: User;
    chat: Chat;

    date: Date;
}

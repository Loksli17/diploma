import User    from './User';
import Message from './Message';


export default interface Chat{
    id?: number;

    userId1: number;
    userId2: number;

    user1?: User;
    user2?: User;

    messages: Array<Message>;
    lastMessage: Message;

    active?: boolean;
}
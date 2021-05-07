import User    from './User';
import Message from './Message';


export default interface Chat{
    id?: number;

    user1Id: number;
    user2Id: number;

    user1?: User;
    user2?: User;

    messages: Array<Message>;
    lastMessage: Message;

    isActive?: boolean;
}
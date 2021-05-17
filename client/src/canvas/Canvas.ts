import User from '@/types/User';
import UserCanvas        from '../types/Canvas/UserCanvas';

enum State{
    POINTER,
    BRUSH,
}


export default class Canvas {

    private canvas: HTMLCanvasElement;
    private ctx   : CanvasRenderingContext2D | null;
    private users : Array<UserCanvas>;
    private state : State;

    constructor(canvas: HTMLCanvasElement, userCanvas: Array<UserCanvas>){
        this.canvas = canvas;
        this.ctx    = canvas.getContext('2d');
        this.users  = userCanvas; 
        this.state  = State.POINTER;
    }

    public userAdd(user: UserCanvas){
        this.users.push(user);
    }

    public removeUser(user: UserCanvas){
        const ind: number = this.users.findIndex(item => user.id == item.id);
        this.users.splice(ind, 1);
    }

}
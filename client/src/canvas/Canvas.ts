import Point      from './Point';
import Line       from './shapes/Line';
import Shape      from './shapes/Shape';
import UserCanvas from './UserCanvas';


export enum State{
    POINTER,
    LINE,
    BRUSH,
}


export default class Canvas{

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;

    private canvasAnimate: HTMLCanvasElement;
    private ctxAnimate: CanvasRenderingContext2D | null;

    private users: Array<UserCanvas>;
    private state: State;
    private countClick: number = 0;
    private currentShape: Shape | undefined;
    private shapes: Array<Shape>;


    constructor(canvas: HTMLCanvasElement, canvasAnimate: HTMLCanvasElement, userCanvas: Array<UserCanvas>){
        
        this.canvas        = canvas;
        this.ctx           = canvas.getContext('2d');
        this.canvasAnimate = canvasAnimate;
        this.ctxAnimate    = canvasAnimate.getContext('2d');

        this.users  = userCanvas; 
        this.state  = State.POINTER;
        this.shapes = [];
    }


    public render(){
        this.shapes[this.shapes.length - 1].render(this.ctx);
    }

    public renderAll(){
        this.clear();
        for(let i = 0; i < this.shapes.length; i++){
            this.shapes[i].render(this.ctx);
        } 
    }


    public userAdd(user: UserCanvas){
        this.users.push(user);
    }

    public removeUser(user: UserCanvas){
        const ind: number = this.users.findIndex(item => user.id == item.id);
        this.users.splice(ind, 1);
    }


    private drawLineProcess(coords: {x: number; y: number}, action: string){


        switch(this.countClick){

            case 0:
                if(action != 'click') break;

                this.currentShape = new Line(
                    new Point(0, coords.x, coords.y),
                    new Point(1, coords.x, coords.y),
                );
                console.log(action, this.countClick);
                this.countClick = 1;
                break;

            case 1:

                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;
                
                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.render();
                    this.countClick = 0;
                    this.animateClear();
                    console.log(action, this.countClick);
                }else{
                    this.animateClear();
                    this.currentShape.render(this.ctxAnimate);
                }
                
                break;
        }
    }

    public setState(state: State){
        this.state = state;
    }

    public getState(){
        return this.state;
    }


    public click(e: any){

        switch (this.state){
            case State.LINE:
                this.drawLineProcess(e, 'click');
                break;
            case State.BRUSH:
                console.log('brush');
                break;
            case State.POINTER: 
                break;
        }
    }


    public mouseMove(e: any){

        switch (this.state){
            case State.LINE:
                this.drawLineProcess(e, 'move');
                break;
            case State.BRUSH:
                break;
            case State.POINTER: 
                break;
        }
    }

    public clear(){
        if(this.ctx == undefined) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public animateClear(){
        if(this.ctxAnimate == undefined) return;
        this.ctxAnimate.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}
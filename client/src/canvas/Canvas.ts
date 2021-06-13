import Point             from './Point';
import Line              from './shapes/Line';
import Rectangle         from './shapes/Rect';
import Circle            from './shapes/Circle';
import Shape             from './shapes/Shape';
import UserCanvas        from './UserCanvas';
import Brush             from './shapes/Brush';
import IsoscelesTriangle from './shapes/IsoscelesTriangle';
import RightTriangle     from './shapes/RightTriangle';
import Bezier            from './shapes/Bezier';
import Ellipse           from './shapes/Ellipse';
import Rhombus           from './shapes/Rhombus';
import Arrow             from './shapes/Arrow';
import Cursor            from './Cursor';
import { Socket } from 'socket.io-client';
import User from '@/types/User';


export enum State{
    CURSOR,
    LINE,
    BRUSH,
    RECT,
    CIRCLE,
    ISOSCELESTRIANGLE,
    RIGHTTRIANGLE,
    BEZIER,
    ELLIPSE,
    RHOMBUS,
    ARROW,
}


export default class Canvas{

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;

    private canvasAnimate: HTMLCanvasElement;
    private ctxAnimate: CanvasRenderingContext2D | null;

    private canvasMouse: HTMLCanvasElement;
    private ctxMouse: CanvasRenderingContext2D | null;

    public users: Array<UserCanvas>;
    private state: State;
    private countClick: number = 0;
    private currentShape: Shape | undefined;
    public  shapes: Array<Shape>;
    private shapesHistory: Array<Shape>;

    public brushWidth: number = 1;
    public brushColor: string = "#000000";
    public fillStatus: boolean = false;
    public backgroundColor: string = "#FFFFFF";

    public width: number = 900;
    public height: number = 500;

    public cursors: Array<Cursor> = [];
    public socket: Socket;
    public currentUser: User;
    public projectId: number;


    constructor(canvas: HTMLCanvasElement, canvasAnimate: HTMLCanvasElement, canvasMouse: HTMLCanvasElement, userCanvas: Array<UserCanvas>, socket: Socket, user: User, projectId: number){
        
        this.canvas = canvas;
        this.ctx    = canvas.getContext('2d');

        this.canvasAnimate = canvasAnimate;
        this.ctxAnimate    = canvasAnimate.getContext('2d');

        this.canvasMouse = canvasMouse;
        this.ctxMouse    = canvasMouse.getContext('2d');

        this.users  = userCanvas; 
        this.state  = State.CURSOR;
        this.shapes = [];

        this.shapesHistory = [];
        this.socket        = socket;
        this.currentUser   = user;
        this.projectId     = projectId;
    }

    public copyData(canvas: {backgroundColor: string; shapes: Array<Shape>; width: number; height: number}): void{

        this.addShapes(canvas.shapes);
        this.backgroundColor = canvas.backgroundColor;
        this.width           = canvas.width;
        this.height          = canvas.height;
    }


    public renderCursors(){
        if(this.ctxMouse == undefined) return;
        this.ctxMouse.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for(let i = 0; i < this.cursors.length; i++){
            this.cursors[i].render(this.ctxMouse);
        }
    }


    public setBackground(value: string){

        if(this.ctx == undefined) return;

        this.backgroundColor = value;
        this.renderAll();
    }


    public render(){
        this.shapes[this.shapes.length - 1].render(this.ctx);
    }

    public renderAll(){
        this.clear();
        for(let i = 0; i < this.shapes.length; i++){
            if(this.shapes[i].isVisible) this.shapes[i].render(this.ctx);
        } 
    }

    public renderForPng(){
        if(this.ctx == undefined) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(let i = 0; i < this.shapes.length; i++){
            if(this.shapes[i].isVisible) this.shapes[i].render(this.ctx);
        }
    }


    public userAdd(user: UserCanvas){
        this.users.push(user);
    }

    public removeUser(user: UserCanvas){
        const ind: number = this.users.findIndex(item => user.id == item.id);
        this.users.splice(ind, 1);
    }

    public shapeWithUserUser(id: number): {shape: Shape; user: UserCanvas}{

        const shape: Shape | undefined = this.shapes.find(item => item.id == id);
        if(shape == undefined) throw new Error('Shape hasnot been founded');

        const user: UserCanvas | undefined = this.users.find(item => item.id == shape.userId);
        if(user == undefined) throw new Error('user hasnot been founded');

        return {user: user, shape: shape};
    }


    public backStep(){
        this.shapes.pop();
        this.renderAll();
    }

    public forwardStep(){
        const index: number = this.shapes.length - 1;

        if(this.shapesHistory[index + 1] == undefined) return;
        this.shapes.push(this.shapesHistory[index + 1]);
        this.render();
    }

    private emitShape(){
        this.socket.emit('drawShape', {
            shape    : this.currentShape,
            user     : this.currentUser,
            projectId: this.projectId,
        });
    }


    private drawLineProcess(coords: {x: number; y: number}, action: string, userId: number){

        switch(this.countClick){

            case 0:
                if(action != 'click') break;

                this.currentShape = new Line(
                    new Point(0, coords.x, coords.y),
                    new Point(1, coords.x, coords.y),
                    userId,
                    this.brushColor,
                    this.brushWidth,
                );
                this.countClick = 1;
                break;

            case 1:
                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;
                
                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                    this.clearAnimate();
                    this.emitShape();
                }else{
                    this.clearAnimate();
                    this.currentShape.render(this.ctxAnimate);
                }
                
                break;
        }
    }


    private drawRectangleProcess(coords: {x: number; y: number}, action: string, userId: number){

        switch(this.countClick){

            case 0:
                if(action != 'click') break;
                
                this.currentShape = new Rectangle(
                    new Point(0, coords.x, coords.y),
                    new Point(1, coords.x, coords.y),
                    userId,
                    this.brushColor,
                    this.brushWidth,
                    this.fillStatus
                );
                this.countClick = 1;
                break;

            case 1:

                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;
                
                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                    this.clearAnimate();
                    this.emitShape();

                }else{
                    this.clearAnimate();
                    this.currentShape.render(this.ctxAnimate);
                }

                break;

        }
    }

    private drawCircleProcess(coords: {x: number; y: number}, action: string, userId: number){
        
        switch(this.countClick){

            case 0:
                if(action != 'click') break;
                
                this.currentShape = new Circle(
                    new Point(0, coords.x, coords.y),
                    new Point(1, coords.x, coords.y),
                    userId,
                    this.brushColor,
                    this.brushWidth,
                    this.fillStatus
                );
                this.countClick = 1;
                break;

            case 1:

                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;
                
                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                    this.clearAnimate();
                    this.emitShape();
                }else{
                    this.clearAnimate();
                    this.currentShape.render(this.ctxAnimate);
                }

                break;

        }
    }

    private drawBrushProcess(coords: {x: number; y: number}, action: string, userId: number){

        switch(this.countClick){

            case 0:

                if(action != 'click') break;
                
                this.currentShape = new Brush(
                    new Point(0, coords.x, coords.y),
                    userId,
                    this.brushColor,
                    this.brushWidth
                );
                
                (this.currentShape as Brush).renderLastPoint(this.ctx);
                this.countClick = 1;
                break;

            case 1:

                if(this.currentShape == undefined) return;
                
                this.currentShape!.points.push(
                    new Point(
                        this.currentShape!.points.length,
                        coords.x,
                        coords.y,
                    )
                );

                (this.currentShape as Brush).renderLastPoint(this.ctx);

                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();
                    this.countClick = 0;
                    this.clearAnimate();
                    this.emitShape();
                }

                break;
        }
    }

    private drawIsoscelesTriangleProcess(coords: {x: number; y: number}, action: string, userId: number){

        switch(this.countClick){

            case 0:

                if(action != 'click') break;
                
                this.currentShape = new IsoscelesTriangle(
                    new Point(0, coords.x, coords.y),
                    new Point(1, coords.x, coords.y),
                    userId,
                    this.brushColor,
                    this.brushWidth,
                    this.fillStatus,
                );
                
                this.countClick = 1;
                break;

            case 1:

                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;

                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                    this.clearAnimate();
                    this.emitShape();
                }else{
                    this.clearAnimate();
                    this.currentShape.render(this.ctxAnimate);
                }

                break;
        }
    }

    private drawRightTriangleProcess(coords: {x: number; y: number}, action: string, userId: number){

        switch(this.countClick){

            case 0:

                if(action != 'click') break;
                
                this.currentShape = new RightTriangle(
                    new Point(0, coords.x, coords.y),
                    new Point(1, coords.x, coords.y),
                    userId,
                    this.brushColor,
                    this.brushWidth,
                    this.fillStatus
                );
                
                this.countClick = 1;
                break;

            case 1:

                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;

                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                    this.clearAnimate();
                    this.emitShape();
                }else{
                    this.clearAnimate();
                    this.currentShape.render(this.ctxAnimate);
                }

                break;
        }
    }


    private drawBezierProcess(coords: {x: number; y: number}, action: string, userId: number){

        switch(this.countClick){

            case 0:

                if(action != 'click') break;
                
                this.currentShape = new Bezier(
                    [
                        new Point(0, coords.x, coords.y),
                        new Point(1, coords.x, coords.y),
                        new Point(2, coords.x, coords.y),
                        new Point(3, coords.x, coords.y),
                    ],
                    userId,
                    this.brushColor,
                    this.brushWidth,
                );
                
                this.countClick = 1;
                break;
                    
            case 1:
                
                if(this.currentShape == undefined) return;

                this.currentShape.points[2].x = coords.x;
                this.currentShape.points[2].y = coords.y;
                this.currentShape.points[3].x = coords.x;
                this.currentShape.points[3].y = coords.y;

                this.clearAnimate();
                this.currentShape.render(this.ctxAnimate);
                
                if(action == 'click') this.countClick = 2;

                break;

            case 2:

                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;
                this.currentShape.points[2].x = coords.x;
                this.currentShape.points[2].y = coords.y;

                this.clearAnimate();
                this.currentShape.render(this.ctxAnimate);
                
                if(action == 'click') this.countClick = 3;

                break;

            case 3:

                if(this.currentShape == undefined) return;

                this.currentShape.points[2].x = coords.x;
                this.currentShape.points[2].y = coords.y;

                if(action == 'click'){
                    this.clearAnimate();
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                    this.emitShape();
                }else{
                    this.clearAnimate();
                    this.currentShape.render(this.ctxAnimate);
                }

                break;
        }
    }

    private drawEllipseProcess(coords: {x: number; y: number}, action: string, userId: number){
        
        switch(this.countClick){

            case 0:
                if(action != 'click') break;
                
                this.currentShape = new Ellipse(
                    [
                        new Point(0, coords.x, coords.y),
                        new Point(1, coords.x, coords.y),
                        new Point(2, coords.x, coords.y)
                    ],
                    userId,
                    this.brushColor,
                    this.brushWidth,
                    this.fillStatus
                );
                this.countClick = 1;
                break;

            case 1:

                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;
                
                this.clearAnimate();
                (this.currentShape as Ellipse).renderStepFirst(this.ctxAnimate);
                
                if(action == 'click') this.countClick = 2;

                break;

            case 2:

                if(this.currentShape == undefined) return;

                this.currentShape.points[2].x = coords.x;
                this.currentShape.points[2].y = coords.y;
                
                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                    this.clearAnimate();
                    this.emitShape();
                }else{
                    this.clearAnimate();
                    this.currentShape.render(this.ctxAnimate);
                }
                
                break;
        }
    }

    private drawRhombusProcess(coords: {x: number; y: number}, action: string, userId: number){

        switch(this.countClick){

            case 0:
                if(action != 'click') break;
                
                this.currentShape = new Rhombus(
                    [
                        new Point(0, coords.x, coords.y),
                        new Point(1, coords.x, coords.y),
                        new Point(2, coords.x, coords.y),
                        new Point(3, coords.x, coords.y)
                    ],
                    userId,
                    this.brushColor,
                    this.brushWidth,
                    this.fillStatus
                );
                this.countClick = 1;
                break;

            case 1:

                if(this.currentShape == undefined) return;

                this.currentShape.points[2].x = coords.x;
                
                this.clearAnimate();
                (this.currentShape as Rhombus).renderStepFirst(this.ctxAnimate);
                
                if(action == 'click') this.countClick = 2;

                break;

            case 2:

                if(this.currentShape == undefined) return;

                this.currentShape.points[1].y = coords.y;
                
                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                    this.clearAnimate();
                    this.emitShape();
                }else{
                    this.clearAnimate();
                    this.currentShape.render(this.ctxAnimate);
                }
                
                break;
        }
    }

    private drawArrowProcess(coords: {x: number; y: number}, action: string, userId: number){

        switch(this.countClick){

            case 0:
                if(action != 'click') break;

                this.currentShape = new Arrow(
                    new Point(0, coords.x, coords.y),
                    new Point(1, coords.x, coords.y),
                    userId,
                    this.brushColor,
                    this.brushWidth,
                );
                this.countClick = 1;
                break;

            case 1:
                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;
                
                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                    this.clearAnimate();
                    this.emitShape();
                }else{
                    this.clearAnimate();
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


    public click(e: any, userId: number){
        this.stateLogic(e, userId, 'click');
    }

    public mouseMove(e: any, userId: number){
        this.stateLogic(e, userId, 'move');
    }

    private stateLogic(e: any, userId: number, action: string){

        switch (this.state){
            case State.LINE:
                this.drawLineProcess(e, action, userId);
                break;
            case State.BRUSH:
                this.drawBrushProcess(e, action, userId);
                break;
            case State.RECT:
                this.drawRectangleProcess(e, action, userId);
                break;
            case State.CIRCLE:
                this.drawCircleProcess(e, action, userId);
                break;
            case State.ISOSCELESTRIANGLE:
                this.drawIsoscelesTriangleProcess(e, action, userId);
                break;
            case State.RIGHTTRIANGLE:
                this.drawRightTriangleProcess(e, action, userId);
                break;
            case State.BEZIER:
                this.drawBezierProcess(e, action, userId);
                break;
            case State.ELLIPSE:
                this.drawEllipseProcess(e, action, userId);
                break;
            case State.RHOMBUS:
                this.drawRhombusProcess(e, action, userId);
                break;
            case State.ARROW:
                this.drawArrowProcess(e, action, userId);
                break;
            case State.CURSOR:
                break;
        }
    }


    public addShape(shape: Shape){
        
        switch(shape.icon){

                case 'line.svg':

                    this.shapes.push(
                        new Line(
                            new Point(shape.points[0].id, shape.points[0].x, shape.points[0].y),
                            new Point(shape.points[1].id, shape.points[1].x, shape.points[1].y),
                            shape.userId,
                            shape.color,
                            (shape as Line).width,
                        )
                    );
                    break;

                case 'rect.svg':
                    
                    this.shapes.push(          
                        new Rectangle(
                            new Point(shape.points[0].id, shape.points[0].x, shape.points[0].y),
                            new Point(shape.points[1].id, shape.points[1].x, shape.points[1].y),
                            shape.userId,
                            shape.color,
                            (shape as Rectangle).width,
                            (shape as Rectangle).fill,
                        )
                    )
                    break;

                case 'circle.svg':

                    this.shapes.push(          
                        new Circle(
                            new Point(shape.points[0].id, shape.points[0].x, shape.points[0].y),
                            new Point(shape.points[1].id, shape.points[1].x, shape.points[1].y),
                            shape.userId,
                            shape.color,
                            (shape as Circle).width,
                            (shape as Circle).fill,
                        )
                    )
                    break;


                case 'isosceles-triangle.svg':

                    this.shapes.push(          
                        new IsoscelesTriangle(
                            new Point(shape.points[0].id, shape.points[0].x, shape.points[0].y),
                            new Point(shape.points[1].id, shape.points[1].x, shape.points[1].y),
                            shape.userId,
                            shape.color,
                            (shape as IsoscelesTriangle).width,
                            (shape as IsoscelesTriangle).fill,
                        )
                    )
                    break;

                case 'right-triangle.svg':

                    this.shapes.push(          
                        new RightTriangle(
                            new Point(shape.points[0].id, shape.points[0].x, shape.points[0].y),
                            new Point(shape.points[1].id, shape.points[1].x, shape.points[1].y),
                            shape.userId,
                            shape.color,
                            (shape as RightTriangle).width,
                            (shape as RightTriangle).fill,
                        )
                    )
                    break;

                case 'bezier.svg':

                    this.shapes.push(          
                        new Bezier(
                            shape.points.slice(),
                            shape.userId,
                            shape.color,
                            (shape as Bezier).width,
                        )
                    )
                    break;
                    

                case 'brush.svg':
                    
                    this.shapes.push(
                        new Brush(
                            new Point(shape.points[0].id, shape.points[0].x, shape.points[0].y),
                            shape.userId,
                            shape.color,
                            (shape as Brush).width,
                        )
                    );

                    this.shapes[this.shapes.length - 1].points = shape.points.slice();

                    break;

                case 'ellipse.svg':
                    
                    this.shapes.push(
                        new Ellipse(
                            shape.points.slice(),
                            shape.userId,
                            shape.color,
                            (shape as Ellipse).width,
                            (shape as Ellipse).fill,
                        )
                    );

                    break;

                case 'rhombus.svg':
                    
                    this.shapes.push(
                        new Rhombus(
                            shape.points.slice(),
                            shape.userId,
                            shape.color,
                            (shape as Rhombus).width,
                            (shape as Rhombus).fill,
                        )
                    );

                    break;

                case 'arrow.svg':
                    
                    this.shapes.push(
                        new Arrow(
                            new Point(shape.points[0].id, shape.points[0].x, shape.points[0].y),
                            new Point(shape.points[1].id, shape.points[1].x, shape.points[1].y),
                            shape.userId,
                            shape.color,
                            (shape as Arrow).width,
                        )
                    );

                    break; 
            }

        this.shapes[this.shapes.length - 1].name = shape.name;
    }


    public addShapes(shapes: Array<Shape>){

        if(shapes == undefined) return;

        for(let i: number = 0; i < shapes.length; i++){
            this.addShape(shapes[i]);
        }
    }

    public clear(){
        if(this.ctx == undefined) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public clearAnimate(){
        if(this.ctxAnimate == undefined) return;
        this.ctxAnimate.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}
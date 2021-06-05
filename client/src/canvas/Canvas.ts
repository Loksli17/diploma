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


export enum State{
    POINTER,
    LINE,
    BRUSH,
    RECT,
    CIRCLE,
    ISOSCELESTRIANGLE,
    RIGHTTRIANGLE,
    BEZIER,
    ELLIPSE,
}


export default class Canvas{

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;

    private users: Array<UserCanvas>;
    private state: State;
    private countClick: number = 0;
    private currentShape: Shape | undefined;
    public  shapes: Array<Shape>;
    private shapesHistory: Array<Shape>;

    public brushWidth: number = 1;
    public brushColor: string = "#000000";
    public fillStatus: boolean = false;


    constructor(canvas: HTMLCanvasElement, userCanvas: Array<UserCanvas>){
        
        this.canvas = canvas;
        this.ctx    = canvas.getContext('2d');

        this.users  = userCanvas; 
        this.state  = State.POINTER;
        this.shapes = [];

        this.shapesHistory = [];
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
                }else{
                    this.renderAll();
                    this.currentShape.render(this.ctx);
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

                }else{
                    this.renderAll();
                    this.currentShape.render(this.ctx);
                }

                break;

        }
    }

    public drawCircleProcess(coords: {x: number; y: number}, action: string, userId: number){
        
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

                }else{
                    this.renderAll();
                    this.currentShape.render(this.ctx);
                }

                break;

        }
    }

    public drawBrushProcess(coords: {x: number; y: number}, action: string, userId: number){

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
                }

                break;
        }
    }

    public drawIsoscelesTriangleProcess(coords: {x: number; y: number}, action: string, userId: number){

        switch(this.countClick){

            case 0:

                if(action != 'click') break;
                
                this.currentShape = new IsoscelesTriangle(
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
                }else{
                    this.renderAll();
                    this.currentShape.render(this.ctx);
                }

                break;
        }
    }

    public drawRightTriangleProcess(coords: {x: number; y: number}, action: string, userId: number){

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
                }else{
                    this.renderAll();
                    this.currentShape.render(this.ctx);
                }

                break;
        }
    }


    public drawBezierProcess(coords: {x: number; y: number}, action: string, userId: number){

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

                this.renderAll();
                this.currentShape.render(this.ctx);
                
                if(action == 'click') this.countClick = 2;

                break;

            case 2:

                if(this.currentShape == undefined) return;

                this.currentShape.points[1].x = coords.x;
                this.currentShape.points[1].y = coords.y;
                this.currentShape.points[2].x = coords.x;
                this.currentShape.points[2].y = coords.y;

                this.renderAll();
                this.currentShape.render(this.ctx);
                
                if(action == 'click') this.countClick = 3;

                break;

            case 3:

                if(this.currentShape == undefined) return;

                this.currentShape.points[2].x = coords.x;
                this.currentShape.points[2].y = coords.y;

                if(action == 'click'){
                    this.shapes.push(this.currentShape);
                    this.shapesHistory = this.shapes.slice();

                    this.render();
                    this.countClick = 0;
                }else{
                    this.renderAll();
                    this.currentShape.render(this.ctx);
                }

                break;
        }
    }

    public drawEllipseProcess(coords: {x: number; y: number}, action: string, userId: number){
        
        switch(this.countClick){

            case 0:
                if(action != 'click') break;
                
                this.currentShape = new Ellipse(
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

                }else{
                    this.renderAll();
                    this.currentShape.render(this.ctx);
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
            case State.POINTER:
                break;
        }
    }


    public addShapes(shapes: Array<Shape>){

        if(shapes == undefined) return;

        for(let i: number = 0; i < shapes.length; i++){

            switch(shapes[i].icon){

                case 'line.svg':

                    this.shapes.push(
                        new Line(
                            new Point(shapes[i].points[0].id, shapes[i].points[0].x, shapes[i].points[0].y),
                            new Point(shapes[i].points[1].id, shapes[i].points[1].x, shapes[i].points[1].y),
                            shapes[i].userId,
                            shapes[i].color,
                            (shapes[i] as Line).width,
                        )
                    );
                    break;

                case 'rect.svg':
                    
                    this.shapes.push(          
                        new Rectangle(
                            new Point(shapes[i].points[0].id, shapes[i].points[0].x, shapes[i].points[0].y),
                            new Point(shapes[i].points[1].id, shapes[i].points[1].x, shapes[i].points[1].y),
                            shapes[i].userId,
                            shapes[i].color,
                            (shapes[i] as Rectangle).width,
                            (shapes[i] as Rectangle).fill,
                        )
                    )
                    break;

                case 'circle.svg':

                    this.shapes.push(          
                        new Circle(
                            new Point(shapes[i].points[0].id, shapes[i].points[0].x, shapes[i].points[0].y),
                            new Point(shapes[i].points[1].id, shapes[i].points[1].x, shapes[i].points[1].y),
                            shapes[i].userId,
                            shapes[i].color,
                            (shapes[i] as Circle).width,
                            (shapes[i] as Circle).fill,
                        )
                    )
                    break;


                case 'isosceles-triangle.svg':

                    this.shapes.push(          
                        new IsoscelesTriangle(
                            new Point(shapes[i].points[0].id, shapes[i].points[0].x, shapes[i].points[0].y),
                            new Point(shapes[i].points[1].id, shapes[i].points[1].x, shapes[i].points[1].y),
                            shapes[i].userId,
                            shapes[i].color,
                            (shapes[i] as IsoscelesTriangle).width,
                            (shapes[i] as IsoscelesTriangle).fill,
                        )
                    )
                    break;

                case 'right-triangle.svg':

                    this.shapes.push(          
                        new RightTriangle(
                            new Point(shapes[i].points[0].id, shapes[i].points[0].x, shapes[i].points[0].y),
                            new Point(shapes[i].points[1].id, shapes[i].points[1].x, shapes[i].points[1].y),
                            shapes[i].userId,
                            shapes[i].color,
                            (shapes[i] as RightTriangle).width,
                            (shapes[i] as RightTriangle).fill,
                        )
                    )
                    break;

                case 'bezier.svg':

                    this.shapes.push(          
                        new Bezier(
                            shapes[i].points.slice(),
                            shapes[i].userId,
                            shapes[i].color,
                            (shapes[i] as Bezier).width,
                        )
                    )
                    break;
                    

                case 'brush.svg':
                    
                    this.shapes.push(
                        new Brush(
                            new Point(shapes[i].points[0].id, shapes[i].points[0].x, shapes[i].points[0].y),
                            shapes[i].userId,
                            shapes[i].color,
                            (shapes[i] as Brush).width,
                        )
                    );

                    this.shapes[this.shapes.length - 1].points = shapes[i].points.slice();

                    break;
                
            }

            
        }
    }

    public clear(){
        if(this.ctx == undefined) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}
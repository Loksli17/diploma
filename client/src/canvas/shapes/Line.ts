import Point from '../Point';
import Shape from './Shape';


export default class Line extends Shape{

    public distance: number;
    public width: number = 1;

    constructor(p1: Point, p2: Point, userId: number, color: string, width: number){
        super(`line${++Line.countNumber}`, userId, color);
        this.points.push(p1);
        this.points.push(p2);

        this.distance = Point.ditanseBetweenPoint(p1, p2);
        this.width    = width;
        this.id       = Line.countId;
        this.icon     = "line.svg";
    }


    render(ctx: CanvasRenderingContext2D | null): void{

        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }

        ctx.lineWidth   = this.width;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);    
        ctx.lineTo(this.points[1].x, this.points[1].y);
        ctx.stroke(); 

    }
}

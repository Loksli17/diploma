import Point from '../Point';
import Shape from './Shape';


export default class Rectangle extends Shape{

    public width: number = 1;
    public fill: boolean = false;


    constructor(p1: Point, p2: Point, userId: number, color: string, width: number, fill: boolean){
        super(`rectangle${++Rectangle.countNumber}`, userId, color);

        this.points.push(p1);
        this.points.push(p2);

        this.width = width;
        this.fill  = fill;
        this.icon  = "rect.svg";
    }


    public render(ctx: CanvasRenderingContext2D | null): void{

        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }

        ctx.lineWidth = this.width;
        
        if(this.fill){
            ctx.fillStyle = this.color;
            ctx.fillRect(this.points[0].x, this.points[0].y, this.points[1].x - this.points[0].x, this.points[1].y - this.points[0].y); 
        }else{
            ctx.strokeStyle = this.color;
            ctx.strokeRect(this.points[0].x, this.points[0].y, this.points[1].x - this.points[0].x, this.points[1].y - this.points[0].y);
        } 
        
    }
}
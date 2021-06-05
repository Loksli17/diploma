import Shape from "./Shape";
import Point from '../Point';


export default class RightlTriangle extends Shape{

    public width: number = 1;
    public fill: boolean = false;

    constructor(p1: Point, p2: Point, userId: number, color: string, width: number, fill: boolean){
        super(`RightTriangle${++RightlTriangle.countNumber}`, userId, color);

        this.points.push(p1);
        this.points.push(p2);
        this.points.push(new Point(0, 0, 0));

        this.width = width;
        this.fill  = fill;
        this.icon  = "isosceles-triangle.svg";
    }


    public render(ctx: CanvasRenderingContext2D | null){
     
        if(ctx == undefined){
            throw new Error("CTX is null. Why ?");
        }

        this.points[2] = new Point(2, this.points[0].x, this.points[1].y);

        ctx.beginPath();
        ctx.lineWidth   = this.width;
        ctx.strokeStyle = this.color;
        ctx.fillStyle   = this.color;

        ctx.moveTo(this.points[0].x, this.points[0].y);
        ctx.lineTo(this.points[1].x, this.points[1].y);
        ctx.lineTo(this.points[2].x, this.points[2].y);
        ctx.lineTo(this.points[0].x, this.points[0].y);

        this.fill ? ctx.fill() : ctx.stroke();
    }
} 
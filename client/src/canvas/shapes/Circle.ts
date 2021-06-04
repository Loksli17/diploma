import Point from '../Point';
import Shape from './Shape';


export default class Circle extends Shape{

    public width: number = 1;
    public fill: boolean = false;
    public radius: number = 10;
    private static countId: number = 0;


    constructor(p1: Point, p2: Point, userId: number, color: string, width: number, fill: boolean){
        super(`Circle${++Circle.countId}`, userId, color);

        this.points.push(p1);
        this.points.push(p2);

        this.width = width;
        this.fill  = fill;
        this.id    = Circle.countId;
        this.icon  = "circle.svg";
    }


    public render(ctx: CanvasRenderingContext2D | null): void{

        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }

        ctx.lineWidth   = this.width;
        ctx.strokeStyle = this.color;

        this.radius = Point.ditanseBetweenPoint(this.points[0], this.points[1]);

        ctx.beginPath();
        ctx.arc(this.points[0].x, this.points[0].y, this.radius, 0, 360, false);
        this.fill ? ctx.fill() : ctx.stroke();
    }
}
import Point from '../Point';
import Shape from './Shape';


export default class Brush extends Shape{

    public width: number = 1;
    public points: Array<Point> = [];


    constructor(p1: Point, userId: number, color: string, width: number){
        super(`brush${++Brush.countNumber}`, userId, color);

        this.color = color;
        this.width = width;
        this.icon  = "brush.svg";

        this.points.push(p1);
    }


    public render(ctx: CanvasRenderingContext2D | null): void{

        if(this.points == undefined) return;

        this.points.forEach((item: Point) => {
            this.renderPoint(ctx, item);
        });
    }

    public renderLastPoint(ctx: CanvasRenderingContext2D | null){
        this.renderPoint(ctx, this.points[this.points.length - 1]);
    }

    private renderPoint(ctx: CanvasRenderingContext2D | null, point: Point){
        
        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }

        ctx.lineWidth = this.width;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(point.x, point.y, this.width, 0, Math.PI * 2, false);
        ctx.fill();
    }
} 


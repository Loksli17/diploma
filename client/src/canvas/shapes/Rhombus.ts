import Point from '../Point';
import Shape from './Shape';

export default class Rhombus extends Shape{

    public width: number = 1;
    public fill: boolean = false;
    public distance1: number = 10;
    public distance2: number = 15;


    constructor(points: Array<Point>, userId: number, color: string, width: number, fill: boolean){
        super(`Rhombus${++Rhombus.countNumber}`, userId, color);

        this.points = points.slice();

        this.width = width;
        this.fill  = fill;
        this.icon  = "rhombus.svg";
    }

    public renderStepFirst(ctx: CanvasRenderingContext2D | null): void{

        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }

        ctx.lineWidth   = this.width;
        ctx.strokeStyle = this.color;
        ctx.fillStyle   = this.color;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        ctx.lineTo(this.points[2].x, this.points[2].y);
        ctx.stroke();

    }


    public render(ctx: CanvasRenderingContext2D | null): void{

        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }

        this.renderSelf(ctx, false);
    }

    
    private renderSelf(ctx: CanvasRenderingContext2D, stepFirst: boolean){
        ctx.lineWidth   = this.width;
        ctx.strokeStyle = this.color;
        ctx.fillStyle   = this.color;

        this.points[1].x = this.points[0].x + (this.points[2].x - this.points[0].x) / 2;

        this.points[3].x = this.points[1].x;
        this.points[3].y = this.points[0].y + (this.points[2].y - this.points[1].y);

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        ctx.lineTo(this.points[1].x, this.points[1].y);
        ctx.lineTo(this.points[2].x, this.points[2].y);
        ctx.lineTo(this.points[3].x, this.points[3].y);
        ctx.lineTo(this.points[0].x, this.points[0].y);
        this.fill ? ctx.fill() : ctx.stroke();
    }

}
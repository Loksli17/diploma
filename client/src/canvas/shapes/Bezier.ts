import Shape from "./Shape";
import Point from '../Point';


export default class Bezier extends Shape{

    public width: number = 1;

    constructor(points: Array<Point>, userId: number, color: string, width: number){
        super(`Bezier${++Bezier.countNumber}`, userId, color);

        this.points = points.slice();

        this.width = width;
        this.icon  = 'bezier.svg';
    }


    public render(ctx: CanvasRenderingContext2D | null): void{

        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }

        ctx.lineWidth   = this.width;
        ctx.strokeStyle = this.color;
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        ctx.bezierCurveTo(this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y, this.points[3].x, this.points[3].y);
        ctx.stroke();

    }
}

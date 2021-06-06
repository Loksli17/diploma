import { popScopeId } from '@vue/runtime-core';
import Point from '../Point';
import Shape from './Shape';


export default class Ellipse extends Shape{

    public width: number = 1;
    public fill: boolean = false;
    public radius1: number = 10;
    public radius2: number = 15;


    constructor(points: Array<Point>, userId: number, color: string, width: number, fill: boolean){
        super(`Ellipse${++Ellipse.countNumber}`, userId, color);

        this.points.push(points[0]);
        this.points.push(points[1]);
        this.points.push(points[2]);

        this.width = width;
        this.fill  = fill;
        this.icon  = "ellipse.svg";
    }

    public renderStepFirst(ctx: CanvasRenderingContext2D | null): void{

        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }

        this.renderSelf(ctx, true);
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

        this.radius1 = Math.sqrt(Math.pow(this.points[1].x - this.points[0].x, 2));
        this.radius2 = stepFirst ? 0 : Math.sqrt(Math.pow(this.points[2].y - this.points[1].y, 2));

        ctx.beginPath();
        ctx.ellipse(this.points[0].x, this.points[0].y, this.radius1, this.radius2, 0, 0, 360, false);
        this.fill ? ctx.fill() : ctx.stroke();
    }


} 


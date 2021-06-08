import Point from '../Point';
import Shape from './Shape';


export default class Arrow extends Shape{

    public distance: number;
    public width: number = 1;

    constructor(p1: Point, p2: Point, userId: number, color: string, width: number){
        super(`Arrow${++Arrow.countNumber}`, userId, color);
        this.points.push(p1);
        this.points.push(p2);

        this.distance = Point.ditanseBetweenPoint(p1, p2);
        this.width    = width;
        this.icon     = "arrow.svg";
    }


    render(ctx: CanvasRenderingContext2D | null): void{

        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }

        ctx.lineWidth   = this.width;
        ctx.strokeStyle = this.color;

        const
            w: number   = 8,
            h: number   = 20,
            x: number   = this.points[1].x - this.points[0].x,
            y: number   = this.points[1].y - this.points[0].y,
            len: number = Point.ditanseBetweenPoint(this.points[0], this.points[1]);

        let
            ox: number   = 0,
            oy: number   = 0,
            nLen: number = 0,
            phi: number  = 0,
            ny: number   = 0,
            nx: number   = 0;

        phi = Math.atan(y / x);
        if (x < 0) phi += Math.PI;
        if (x == 0 && y > 0) phi = Math.PI / 2;
        if (x == 0 && y == 0) phi = 3 * Math.PI / 2;

        ny = (this.points[0].x - this.points[1].x); 
        nx = (this.points[1].y - this.points[0].y);
        nLen = Math.sqrt(nx * nx + ny * ny);
        nx = nx / nLen * w; 
        ny = ny / nLen * w;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);    
        ctx.lineTo(this.points[1].x, this.points[1].y);

        ox = this.points[0].x + (len - h) * Math.cos(phi);
        oy = this.points[0].y + (len - h) * Math.sin(phi);

        ctx.moveTo(this.points[1].x, this.points[1].y);
        ctx.lineTo(ox + nx, oy + ny);
        ctx.moveTo(this.points[1].x, this.points[1].y);
        ctx.lineTo(ox - nx, oy - ny);
        ctx.stroke();
    }
}

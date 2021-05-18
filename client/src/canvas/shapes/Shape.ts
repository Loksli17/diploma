import Point from '../Point';


export default abstract class Shape{

    public color : string;
    public points: Array<Point>; 
    public name  : string;


    constructor(name: string = "object"){
        this.color  = "#000";
        this.points = [];
        this.name   = name;
    }

    public setPoints(arr: Array<Point>){this.points = arr}

    public addPoint(Point: Point){this.points.push(Point)}

    public removePoint(Point: Point){
        const id: number = this.points.findIndex(item => item.id == Point.id);
        this.points.splice(id, 1);
    }

    public abstract render(ctx: CanvasRenderingContext2D | null): void;
    
}
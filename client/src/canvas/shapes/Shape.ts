import Point from '../Point';


export default abstract class Shape{

    public color: string = "#000000";
    public points: Array<Point>; 
    public name: string;
    public userId: number;
    public id: number = 0;
    public icon: string = "";


    constructor(name: string = "object", userId: number, color: string = "#000"){
        this.color  = color;
        this.points = [];
        this.name   = name;
        this.userId = userId;
    }

    public setPoints(arr: Array<Point>){this.points = arr}

    public addPoint(Point: Point){this.points.push(Point)}

    public removePoint(Point: Point){
        const id: number = this.points.findIndex(item => item.id == Point.id);
        this.points.splice(id, 1);
    }

    public abstract render(ctx: CanvasRenderingContext2D | null): void;
    
}
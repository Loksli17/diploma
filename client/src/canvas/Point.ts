

export default class Point{

    public id: number;
    public x: number;
    public y: number;

    constructor(id: number, x: number, y: number){
        this.id = id;
        this.x  = x;
        this.y  = y;
    }

    public static ditanseBetweenPoint(f: Point, s: Point): number{
        return Math.sqrt(Math.pow(s.x - f.x, 2) + Math.pow(s.y - f.y, 2));
    }
}
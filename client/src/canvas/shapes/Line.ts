import Point from '../Point';
import Shape from './Shape';


export default class Line extends Shape{

    public distance: number;

    constructor(p1: Point, p2: Point){
        super('line');
        this.points.push(p1);
        this.points.push(p2);
        this.distance = Point.ditanseBetweenPoint(p1, p2);
    }

    public render(){
        console.log('render...')
    }
}

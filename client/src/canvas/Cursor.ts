

export default class Cursor{

    public x: number = 0;
    public y: number = 0;
    public userId: number = 0;
    public name: string = "";
    public color: string = "#000000";
    private readonly alphabet: Array<string> = 'abcdefghijklmnopqrstuvwxyz'.split('');
    public colors: Array<string> = [];

    constructor(firstName: string, lastName: string, id: number){
        this.name   = `${firstName} ${lastName}`;
        this.userId = id;
        this.color  = this.createColor();
    }

    private createColor(): string{
        const letters: Array<string> = this.name.toLowerCase().split('');
        let sum: number = 0;

        for(let i = 0; i < letters.length; i++){
            sum += this.alphabet.indexOf(letters[i]);
        }

        return "#" + (sum * sum * sum).toString(16);
    }

    public render(ctx: CanvasRenderingContext2D | null){

        if(ctx == undefined){
            throw new Error("CTX is null. Why?");
        }  
            
        ctx.fillStyle = this.color;

        const a = 5, b = 4, c = 3, coef = 5;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + a * coef);
        ctx.lineTo(this.x + c * coef, this.y + b * coef);
        ctx.lineTo(this.x, this.y);
        ctx.fill();

        ctx.font = "14px serif";
        ctx.fillText(this.name, this.x + 15, this.y + 35);
    }
}

export default class Post{
    
    public static checkData<T extends object>(obj: T, props: Array<keyof T>): Array<keyof T>{

        let result: Array<keyof T> = [];
        
        for(let i = 0; i < props.length; i++){
            if(!Object.prototype.hasOwnProperty.call(obj, props[i])){
                result.push(props[i]);       
            }
        }

        return result;
    }
}
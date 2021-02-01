import {ValidationError} from 'class-validator';
import crypto            from 'crypto-js';


interface ErrorForFront{
    name: string,
    msg : string,
}

export default {
    parseValidateError: function(inputErrors: Array<ValidationError>): Array<ErrorForFront>{

        let result: Array<ErrorForFront> = [];

        for(let i = 0; i < inputErrors.length; i++){
            let temp: ErrorForFront = {name: '', msg: ''};
            
            temp.name = inputErrors[i].property;

            for(let key in inputErrors[i].constraints){
                temp.msg = inputErrors[i].constraints![key];
            }
            
            result.push(temp);
        }
        
        return result;
    },

    parseFileName: function(file: any, ident: number | string){
        let
            type: string = file.name.substring(file.name.indexOf('.') + 1).toLowerCase(),
            name: string = crypto.SHA256(`${file.name}${ident}`).toString();

        return `${name}.${type}`;
    }
}
import {ValidationError} from 'class-validator';


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
    }
}
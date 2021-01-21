<template>
    <form :class=className :id=id :action=action method='post' @submit.prevent="sendData">
        <div class="form-row" v-for="row in printRows" :key='row'>
            <label class="form-col" v-for="item in row" :key='item.name'>
                <span v-if="item.type != 'submit'">{{item.label ?? $filters.upperFirst(item.name)}}</span>
                
                <textarea v-if="item.type == 'textarea'" v-model="item.value" :name=item.name></textarea>
                
                <select v-else-if="item.type == 'select'" v-model="item.selected" :name=item.name :multiple=item.multiple>
                    <option v-for="option in item.options" :key="option.id">{{option.text}}</option>
                </select>
                
                <input v-else :type=item.type :name=item.name v-model="item.value"
                    :max=item.max
                    :min=item.min 
                    :pattern=item.pattern
                    :required=item.required
                    :disabled=item.disabled
                    :readonly=item.readonly
                    :placeholder=item.placeholder
                    :step=item.step
                    :autocomplete=item.autocomplete
                    :autofocus=item.autofocus
                />

                <div v-if="item.error" class="error">{{item.error}}</div>
            </label>
        </div>
    </form>
</template>


<script lang="ts">
    import {defineComponent} from "vue";
    import config            from '../../config/config';

    interface Prop{
        name: string;
        value: string;
    }

    export interface Option{
        text: string;
        id: string | number;
    }

    export interface FormItem{
        type: string;
        name: string;
        error?: string;

        //input
        value?: string | number | Date;
        max?: number;
        min?: number;
        label?: string;
        placeholder?: string | number | Date;
        required?: boolean;
        step?: number | string;
        disabled?: boolean;
        pattern?: RegExp;
        autofocus?: boolean;
        autocomplete?: boolean;

        //select
        options?: Array<Option>;
        selected?: string | number;
        multiple?: boolean;
    }

    export default defineComponent({
        methods: {

            resetRows: function(){
                for(let i = 0; i < this.printRows.length; i++){
                    for(let j = 0; j < this.printRows[i].length; j++){
                        delete this.printRows[i][j].error;
                    }
                }
            },

            createPropsToSend: function(): Array<Prop> {
                const propsToSend: Array<Prop> = [];
                
                for(let i = 0; i < this.printRows.length; i++){
                    for(let j = 0; j < this.printRows[i].length; j++){
                        switch(this.printRows[i][j].type){
                            case 'submit':
                                break;
                            case 'select':
                                propsToSend.push({name: this.printRows[i][j].name, value: this.printRows[i][j].selected?.toString() || ''});
                                break;
                            case 'date':
                                propsToSend.push({name: this.printRows[i][j].name, value: this.$filters.dateToDb(this.printRows[i][j].value?.toString() || '')});
                                break;
                            case 'datetime':
                                propsToSend.push({name: this.printRows[i][j].name, value: this.$filters.datetimeToDb(this.printRows[i][j].value?.toString() || '')});
                                break;
                            case 'time':
                                propsToSend.push({name: this.printRows[i][j].name, value: this.$filters.timeToDb(this.printRows[i][j].value?.toString() || '')});
                                break;
                            default:
                                propsToSend.push({name: this.printRows[i][j].name, value: this.printRows[i][j].value?.toString() || ''});
                        }
                    }
                }
                return propsToSend;
            },

            pullFormData: function(){
                const propsToSend: Array<Prop> = this.createPropsToSend();

                if(this.tableName != undefined){
                    this.formData[this.tableName] = {};
                    for(let i = 0; i < propsToSend.length; i++){
                        this.formData[this.tableName][propsToSend[i].name] = propsToSend[i].value;
                    }              
                }else{
                    for(let i = 0; i < propsToSend.length; i++){
                        this.formData[propsToSend[i].name] = propsToSend[i].value;
                    }
                }
            },
            
            sendData: async function(){
                this.resetRows();
                this.pullFormData();
                const result = await this.$axios.post(this.action, JSON.stringify(this.formData), {
                    headers: config.headers,
                });
                this.result = result;
                this.parseResult();
            },

            parseResult: function(){
                if(this.result.status == 202){
                    for(let i = 0; i < this.result.data.errors.length; i++){
                        for(let j = 0; j < this.printRows.length; j++){
                            for(let k = 0; k < this.printRows[j].length; k++){
                                if(this.result.data.errors[i].name === this.printRows[j][k].name){
                                    this.printRows[j][k].error = this.result.data.errors[i].msg;
                                }
                            }
                        }
                    }

                }else if(this.result.status == 201){
                    //all right
                    console.log('fuck yes');
                }
            }
        },

        props: {
            action: {
                type    : String,
                required: true,
            },
            method: {
                type    : String,
                required: true,
            },
            id: {
                type: String,
            },
            className: {
                type: String,
            },
            tableName: {
                type: String,
            },
            rows: {
                default : [], 
                type    : Array as () => Array<Array<FormItem>>,
                required: true,
            }
        },

        data(){
            return{
                printRows: Array.from(this.rows) as Array<Array<FormItem>>,
                formData : {} as {[k: string]: any},
                result   : {} as {[k: string]: any},
            }
        },

        created(){
            //checking of data
            for(let i = 0; i < this.rows.length; i++){
                for(let j = 0; j < this.rows[i].length; j++){
                    switch(this.rows[i][j].type){
                        case 'select': 
                            break;
                        case 'textarea':
                            break;
                        default:
                            //checking type of input
                            if(this.rows[i][j].options != undefined){
                                throw new Error(`You must not add 'options' for input. Only select has this property`);
                            }else if(this.rows[i][j].selected != undefined){
                                throw new Error(`You must not add 'selected' for input. Only select has this property. Check form element with indexes: ${i}, ${j}`);
                            }
                    }
                }
            }
        }
    });
</script>


<style lang="scss">
    form{
        display: grid;
        row-gap: 20px;
        max-width: 400px;
        
        .form-row{
            display: grid;
            column-gap: 15px;
            grid-auto-flow: column;
        }

        .form-col{
            display: grid;
            row-gap: 10px;

            span{
                text-align: left;
                font-size: 18px;
                font-weight: 500;
            }

            input{
                padding: 10px;
                font-size: 15px;
            }
        }
    }
</style>
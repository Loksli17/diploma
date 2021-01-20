<template>
    <form :class=className :id=id :action=action :method=method @submit.prevent="sendData">
        <div class="form-row" v-for="row in rows" :key='row'>
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
            </label>
        </div>
    </form>
</template>


<script lang="ts">
    import {defineComponent} from "vue";

    export interface Option{
        text: string;
        id: string | number;
    }

    export interface FormItem{
        type: string;
        name: string;

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
            sendData: async function(e: any){

                const formData: FormData = new FormData();

                for(let i = 0; i < this.rows.length; i++){
                    for(let j = 0; j < this.rows[i].length; j++){

                        let tempValue: string = '';

                        switch(this.rows[i][j].type){
                            case 'submit':
                                break;
                            
                            case 'select':
                                break;

                            case 'date':
                                break;

                            case 'datetime':
                                break;

                            case 'time':
                                break;

                            default:
                                if(this.rows[i][j] != undefined && this.rows[i][j].value != undefined){
                                    tempValue = this.rows[i][j].value?.toString() || '';
                                }else{
                                    tempValue = '';
                                }
                        }

                        formData.append(this.rows[i][j].name, tempValue); 
                    }
                }

                console.log(formData.get('user[firstName]'), formData.get('user[lastName]'), formData.get('user[login]'), formData.get('user[email]'), formData.get('user[password]'));
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
            rows: {
                default : [], 
                type    : Array as () => Array<Array<FormItem>>,
                required: true,
            }
        },

        data(){
            return{
                formData: [] as Array<object>,
            }
        },

        created(){
            for(let i = 0; i < this.rows.length; i++){
                for(let j = 0; j < this.rows[i].length; j++){

                    switch(this.rows[i][j].type){
                        case 'select': 
                            break;

                        case 'textarea':
                            break;

                        default:
                            //check type of input
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
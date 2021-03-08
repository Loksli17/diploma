<template>
    <form :class=className :id=id :action=action method='post' @submit.prevent="sendData">
        <div class="form-row" v-for="row in printRows" :key='row'>

            <template v-for="item in row" :key='item.name'>
                <label v-if="item.type != 'hidden'" :class="{'error': item.error}" class="form-col">
                    <span v-if="item.type != 'submit'">{{item.label ?? $filters.upperFirst(item.name)}}</span>
                    
                    <textarea v-if="item.type == 'textarea'" v-model="item.value" :name=item.name
                        :maxlength=item.maxLength
                        :rows=item.rows
                        :cols=item.cols
                        :wrap=item.wrap
                        :tabindex=item.tabIndex
                    >
                    </textarea>

                    <select v-else-if="item.type == 'select'" v-model="item.selected" :name=item.name :multiple=item.multiple :disabled=item.disabled>
                        <option v-for="option in item.options" :key="option.id" :value="option.id">{{option.text}}</option>
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

                    <div v-if="item.error" class="error-msg">{{item.error}}</div>
                </label>
            </template>
        </div>
    </form>
</template>


<script lang="ts">
    import {defineComponent} from "vue";
    import config            from '../config/config';

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

        //textarea
        cols?: number;
        maxLenth?: number;
        rows?: number;
        tabindex?: number;
        wrap?: string;
    }

    export default defineComponent({

        props: {
            action: {
                type    : String,
                required: true,
            },
            successCode: {
                type    : Number,
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
            overloadParseResult: {
                type: Boolean,
            },
            rows: {
                default : [], 
                type    : Array as () => Array<Array<FormItem>>,
                required: true,
            },
            typeSend: {
                default: 'axios',
                type   : String,
            }
        },

        
        data(){ 
            return{
                printRows: JSON.parse(JSON.stringify(this.rows)) as Array<Array<FormItem>>,
                formData : {} as {[k: string]: any},
                result   : {} as {[k: string]: any},
            }
        },

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


            sendAxios: async function(){
                try {
                    this.result = await this.$axios.post(this.action, JSON.stringify(this.formData), {
                        headers: config.headers,
                    });

                    if(this.overloadParseResult){
                        this.$emit('result-parser', this.result);
                        return;
                    }

                    if(this.result.status == this.successCode){
                        this.$flashMessage.show({
                            type: 'success',
                            // image: require("../../assets/flashMessage/fail.svg"),
                            text: this.result.data.msg,
                        });
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            // image: require("../../assets/flashMessage/fail.svg"),
                            text: `Unexpected server error`,
                        });
                    }
                }catch(err){
                    Object.assign(this.result, err.response);
                    if(this.overloadParseResult){
                        this.$emit('result-parser', this.result);
                    }
                    this.parseErrors();
                    throw new Error(err);
                }
            },

            sendSocket: function(){
                try{
                    this.result = this.$socket?.emit(this.action, this.formData);
                }catch(err){
                    Object.assign(this.result, err.response);
                    if(this.overloadParseResult){
                        this.$emit('result-parser', this.result);
                    }
                    this.parseErrors();
                    throw new Error(err);
                }
            },
            
            sendData: async function(){
                this.resetRows();
                this.pullFormData();

                switch(this.typeSend){
                    case 'socket':
                        this.sendSocket();
                        break;
                    case 'axios':
                        this.sendAxios();
                        break;
                }                
            },

            parseErrors: function(){
                for(let i = 0; i < this.result.data.errors.length; i++){
                    for(let j = 0; j < this.printRows.length; j++){
                        for(let k = 0; k < this.printRows[j].length; k++){
                            if(this.result.data.errors[i].name === this.printRows[j][k].name){
                                this.printRows[j][k].error = this.result.data.errors[i].msg;
                            }
                        }
                    }
                }
            },

            checkTypeSend: function(){
                const whileList: Array<string> = ['axios', 'socket'];

                if(!whileList.includes(this.typeSend)){
                    throw new Error('Type of checkSendType must be axios or socket');
                }
            },

            checkRows: function(){
                for(let i = 0; i < this.rows.length; i++){
                    for(let j = 0; j < this.rows[i].length; j++){
                        const 
                            selectProp: Array<string> = [
                                'name',
                                'type',
                                'error',
                                'label',

                                'selected',
                                'options',
                                'multiple',
                                'disabled',
                            ],
                            inputProp: Array<string> = [
                                'name',
                                'type',
                                'error',
                                'label',
                                'value',

                                'max',
                                'min',
                                'pattern',
                                'required',
                                'disabled',
                                'readonly',
                                'placeholder',
                                'step',
                                'autocomplete',
                                'autofocus',
                            ],
                            textProp: Array<string> = [
                                'name',
                                'type',
                                'error',
                                'label',
                                'value',
                                'cols',
                                'maxLength',
                                'rows',
                                'tabIndex',
                                'wrap',
                            ];

                        switch(this.rows[i][j].type){
                            case 'select': 
                                for(const key in this.rows[i][j]){
                                    if(!selectProp.includes(key)){
                                        throw new Error(`error select in row: ${i} and elem: ${j} with prop: ${key}`);
                                    }
                                }
                                break;
                            case 'textarea':
                                for(const key in this.rows[i][j]){
                                    if(!textProp.includes(key)){
                                        throw new Error(`error text in row: ${i} and elem: ${j} with prop: ${key}`);
                                    }
                                }
                                break;
                            default:
                                for(const key in this.rows[i][j]){
                                    if(!inputProp.includes(key)){
                                        throw new Error(`error input in row: ${i} and elem: ${j} with prop: ${key}`);
                                    }
                                }
                        }
                    }
                }
            },
        },

        created(){
            this.checkRows();
            this.checkTypeSend();
        }
    });
</script>
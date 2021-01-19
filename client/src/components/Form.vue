<template>
    <form :class=className :id=id :action=action :method=method>
        <div class="form-row" v-for="row in rows" :key='row'>
            <label class="form-col" v-for="item in row" :key='item.name'>
                <span>{{item.label ?? $filters.upperFirst(item.name)}}</span>
                
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

    interface Option{
        text: string;
        id: string | number;
    }

    interface FormItem{
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

    // interface FormData{

    // }

    export default defineComponent({
        methods: {
            sendData: function(e: any){
                console.log();
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
                type: Array,
            }
        },
        mounted(){
            console.log(this.rows);
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
            grid-auto-flow: row;
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
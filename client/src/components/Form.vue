<template>
    <form :class=className :id=id :action=action :method=method>
        <div class="row" v-for="row in rows" :key='row'>
            <label v-for="item in row" :key='item.name'>
                <span>{{item.label}}</span>
                
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

    const rows: Array<Array<FormItem>> = [
        [
            {type: 'text',     name: 'login',    label: 'Username or E-mail', autofocus: true},
            {type: 'select',   name: 'testList', options: [{text: 'kek', id: 1}, {text: 'lol', id: 2}], selected: 'lol'},
        ],
        [
            {type: 'password', name: 'password', label: 'Password'},
            {type: 'select',   name: 'testList', options: [{text: 'kek', id: 1}, {text: 'lol', id: 2}], selected: 'lol'},
        ],
        [
            {type: 'number',   name: 'test',     label: 'TEST'},
            {type: 'submit',   name: 'submit',   value: 'Log in'},
        ]
    ]

    const Form = defineComponent({
        data(){
            return {
                action   : '/auth/login',
                rows     : rows,
                method   : 'post',
                className: 'login-form',
            } 
        },
        methods: {

        },
    });

    export {
        Form,
        Option,
        FormItem
    };
</script>
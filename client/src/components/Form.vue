<template>
    <form :action=action>
        <div class="row" v-for="item in items" :key='item.name'>
            <input :type=item.type :value=item.value :name=item.name>
        </div>
    </form>
</template>

<script lang="ts">
    import {defineComponent} from "vue"

    export default defineComponent({
        data(){
            
            interface FormItem{
                tagType?: string; //input or textarea
                type: string; //check enum for this
                value?: string | number;
                max?: number;
                min?: number;
                name: string; 
            }

            const items: Array<FormItem> = [
                {type: 'text',   name: 'login'},
                {type: 'submit', name: 'submit', value: 'Log in'},
            ];

            return {
                action: 'post',
                items : items,
            } 
        },
    });
</script>
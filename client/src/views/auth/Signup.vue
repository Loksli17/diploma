<template>
    <div>
        <div></div>
        <div>
            <AuthNav v-bind:ind='1'/>
            <h1>Signup</h1>
            <Form
                v-bind:rows="rowsFormSignup"
                v-bind:action="'/auth/signup'"
                v-bind:method="'post'"
                v-bind:className="'signup-form'"
            />
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    import AuthNav           from '../../components/auth/AuthNav.vue';
    import Form              from '../../components/Form.vue'; 
    import {FormItem}        from '../../components/Form.vue';
    
    export default defineComponent({
        data(){
            return {
                rowsFormSignup: [
                    [
                        {type: 'text', name: 'user[firstName]', label: 'Name',},
                        {type: 'text', name: 'user[lastName]',  label: 'Surname'}, 
                    ],
                    [
                        {type: 'text',  name: 'user[login]', label: 'Login'},
                        {type: 'email', name: 'user[email]', label: 'E-mail'}, 
                    ],
                    [
                        {type: 'password',  name: 'user[password]', label: 'Password'},
                    ],
                    [{type: 'submit', name: 'submit', value: 'Sign up'}],
                ] as Array<Array<FormItem>>,
            }
        },
        components: {
            AuthNav,
            Form,
        },
    });
    
</script>
<template>
    <div>
        <div>
            <AuthNav v-bind:ind='0'/>
            <h1>Login</h1>
            <Form
                v-bind:rows="rowsFormLogin"
                v-bind:action="'/auth/login'"
                v-bind:method="'post'"
                v-bind:className="'login-form'"
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
                rowsFormLogin: [
                    [{type: 'time', name: 'date'}],
                    [{type: 'text', name: 'data[login]', label: 'Username or E-mail'},],
                    [{type: 'password', name: 'data[password]', label: 'Password'},],
                    [{type: 'submit', name: 'submit', value: 'Log in'}],
                ] as Array<Array<FormItem>>,
            }
        },
        components: {
            AuthNav,
            Form,
        },
    });

</script>
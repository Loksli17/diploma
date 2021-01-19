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

    export default defineComponent({
        data(){
            return {
                rowsFormLogin:[
                    [
                        {type: 'text',     name: 'data[login]',    label: 'Username or E-mail'},
                        {type: 'password', name: 'data[password]', label: 'Password'},
                        {type: 'textarea', name: 'kek'},
                        {type: 'select',   name: 'holod-pidor', options: [{id: 1, text: 'holod1'}, {id: 2, text: 'holodPivo'}], selected: 'holodPivo'},
                    ],
                    [{type: 'submit', name: 'submit', value: 'Log in'}],
                ],
            }
        },
        components: {
            AuthNav,
            Form,
        },
    });

</script>
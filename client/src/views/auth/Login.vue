<template>
    <div>
        <div>
            <AuthNav v-bind:ind='0'/>
            <h1>Login</h1>
            <Form
                v-bind:rows="rowsFormLogin"
                v-bind:action="'/auth/login'"
                v-bind:className="'login-form'"
                v-bind:successCode="200"
                v-bind:overloadParseResult="true"
                v-on:result-parser="formResultParser"
            />
        </div>
    </div>
</template>


<script lang="ts">
    import {defineComponent} from 'vue';
    import AuthNav           from '../../components/auth/AuthNav.vue';
    import Form, {FormItem}  from '../../components/Form.vue';

    export default defineComponent({
        data(){
            return {
                rowsFormLogin: [
                    [{type: 'text',     name: 'email',    label: 'E-mail'},],
                    [{type: 'password', name: 'password', label: 'Password'},],
                    [{type: 'submit',   name: 'submit',   value: 'Log in'}],
                ] as Array<Array<FormItem>>,
            }
        },

        methods: {
            formResultParser: function(result: any){
                console.log(result.data);

                this.$flashMessage.show({
                    type: 'success',
                    text: result.data.msg,
                });
            }
        },

        components: {
            AuthNav,
            Form,
        },
    });

</script>
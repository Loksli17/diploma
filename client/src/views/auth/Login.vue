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
    import User              from '../../types/User';
    import moment            from 'moment';


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

                if(result.status === 400){
                    return;
                }

                this.$flashMessage.show({
                    type: 'success',
                    text: result.data.msg,
                });

                result.data.user.authDate = moment().add(1, 'd');

                this.$store.commit('setUserIdentity', result.data.user);
                this.$store.commit('setJWT', result.data.token);

                this.$socket.open();

                this.$axios.defaults.headers.common['Authorization'] = this.$store.state.jwt;
                this.$router.push('/');
            },
        },

        components: {
            AuthNav,
            Form,
        },
    });

</script>
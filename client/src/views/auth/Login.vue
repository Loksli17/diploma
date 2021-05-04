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
    declare const require: any
    import {defineComponent} from 'vue';
    import AuthNav           from '../../components/auth/AuthNav.vue';
    import Form, {FormItem}  from '../../components/Form.vue';
    import User              from '../../types/User';
    import moment            from 'moment';
    import Notification      from '../../types/Notification';


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

            getNotifications: async function(id: number): Promise<Notification | undefined>{

                try {
                    const res = await this.$axios.post('/notification/get-notifications', {userId: id, type:"receive"});

                    if(res.status == 200){
                        return res.data.notifications;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            text: 'Error with query',
                            image: require("../../assets/flash/fail.svg"),
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                        image: require("../../assets/flash/fail.svg"),
                    });
                    console.error(err);
                }
            },


            formResultParser: async function(result: any){

                if(result.status === 400){
                    return;
                }

                this.$flashMessage.show({
                    type : 'success',
                    image: require("../../assets/flash/success.svg"),
                    text : result.data.msg,
                });

                result.data.user.authDate = moment().add(1, 'd');

                this.$store.commit('setUserIdentity', result.data.user);
                this.$store.commit('setJWT', result.data.token);

                const user: User = this.$store.state.userIdentity!;
                delete user.authDate;

                this.$socket.io!.opts!.query!.user = JSON.stringify(user);
                this.$socket.open();

                this.$axios.defaults.headers.common['Authorization'] = this.$store.state.jwt;
                this.$router.push('/');

                this.$store.commit('setNotifications', []);
                console.log(this.$store.commit('setNotifications', []));
                this.$store.commit('setNotifications', await this.getNotifications(result.data.user.id));
            },
        },

        components: {
            AuthNav,
            Form,
        },
    });

</script>

<style lang="scss">
    @import '../../assets/scss/index';
</style>
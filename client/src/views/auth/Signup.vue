<template>
    <div>
        <AuthNav v-bind:ind='1'/>
        
        <div class="signup-page">

            <div class="wrap">
                <h1>Signup</h1>
                <Form
                    v-bind:rows="rowsFormSignup"
                    v-bind:action="'/auth/signup'"
                    v-bind:tableName="'user'"
                    v-bind:className="'signup-form'"
                    v-bind:successCode="201"
                    v-bind:overloadParseResult="true"
                    v-on:result-parser="formResultParser"
                />
            </div>
            
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
                rowsFormSignup: [
                    [
                        {type: 'text', name: 'firstName', label: 'Name',},
                        {type: 'text', name: 'lastName',  label: 'Surname'}, 
                    ],
                    [
                        {type: 'text',  name: 'login', label: 'Login'},
                        {type: 'email', name: 'email', label: 'E-mail'}, 
                    ],
                    [
                        {type: 'password',  name: 'password', label: 'Password'},
                    ],
                    [{type: 'submit', name: 'submit', value: 'Sign up'}],
                ] as Array<Array<FormItem>>,
            }
        },

        methods: {
            formResultParser: function(result: any){

                if(result.status == 400){
                    return;
                }

                this.$router.push('/login');
                
                this.$flashMessage.show({
                    type: 'success',
                    // image: require("../../assets/flashMessage/fail.svg"),
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


<style lang="scss">
    @import '../../assets/scss/pages/auth/signup.scss';
</style>
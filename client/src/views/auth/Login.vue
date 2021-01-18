<template>
    <div>
        <div></div>
        <div>
            <AuthNav/>
            <h1>Login</h1>
            <Form/>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    import AuthNav           from '../../components/auth/AuthNav.vue';
    import {Form}            from '../../components/Form.vue';

    // Form.data = function(){
    //     return {
    //         action   : '/auth/login',
    //         rows     : [
    //             [{type: 'text',   name: 'login',  label: 'Username or E-mail'}],
    //             [{type: 'submit', name: 'submit', value: 'Log in'}],
    //         ],
    //         method   : 'post',
    //         className: 'login-form',
    //     }
    // }
    
    export default defineComponent({
        components: {
            AuthNav,
            Form,
        }
    });

</script>
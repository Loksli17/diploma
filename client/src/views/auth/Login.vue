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
    import Form              from '../../components/Form.vue';
    
    export default defineComponent({
        components: {
            AuthNav,
            Form,
        }
    });

</script>
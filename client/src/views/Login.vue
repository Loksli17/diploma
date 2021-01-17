<template>
    <div>
        <div></div>
        <div>
            <AuthNav/>
            <h1>Login</h1>
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    import AuthNav           from '../components/auth/AuthNav.vue';
    
    export default defineComponent({
        components: {
            AuthNav,
        }
    });

</script>
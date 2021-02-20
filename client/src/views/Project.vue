<template>
    <div>
            <Menu></Menu>
        <h1>Project</h1>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    import Menu              from '../components/Menu.vue';
    
    export default defineComponent({
        
        
        components: {
            Menu,
        },
    });
</script>
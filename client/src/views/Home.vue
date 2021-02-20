<template>
    <div>
        <Menu></Menu>
        <h1>main page</h1>
    </div>
   
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    import Menu              from '../components/Menu.vue';
    
    export default defineComponent({

        mounted: async function(){
            
            try {
                const res = await this.$axios.post('project/get-projects', {take: 8, skip: 0});      
            }catch(err){
                console.log(err);
            }
        },

        components: {
            Menu,
        },
    });
</script>

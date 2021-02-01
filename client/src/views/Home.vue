<template>
    <h1>main page</h1>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    
    export default defineComponent({
        components: {
            
        },

        mounted: async function(){
            
            try {
                const res = await this.$axios.post('project/get-projects', {take: 8, skip: 0});      
            }catch(err){
                console.log(err);
            }
        }
    });
</script>

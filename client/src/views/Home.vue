<template>
    <h1>main page</h1>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    
    export default defineComponent({
        components: {
            
        },

        created: async function(){

            console.log(this.$store.state.userIdentity, this.$store.state.jwt);
            
            try {
                console.log('azazaza');
                const result = await this.$axios.post('project/get-projects', {take: 8, skip: 0}); 
                console.log('whwh', result);      
            }catch(err){
                console.log(err)
            }
        }
    });
</script>

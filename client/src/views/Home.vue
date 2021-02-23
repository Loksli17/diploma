<template>
    <div class="page-home">
        <Menu></Menu>
        <div class="page-wrap">

            <div class="section">
                <div class="row">
                    <div>
                        <button class="btn new-project-btn" @click="newProjectEvt">
                            <span></span>
                            <span>New project</span>
                        </button>
                    </div>

                    <div>
                        <form action="" @submit.prevent="sendData">
                            <input type="search">
                        </form>
                    </div>

                    <div>
                        <form action="">
                            <select name="" id="">
                                <option value="all">All projects</option>
                                <option value="self">My projects</option>
                            </select>
                        </form>
                    </div>

                </div>

                <div class="row">
                    
                </div>

                <div class="row">

                </div>
            </div>

            <div class="aside">

            </div>
            
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    import Menu              from '../components/Menu.vue';
    
    export default defineComponent({

        data: function(){
            return {
                projects: [] as Array<object>,
            }  
        },

        methods: {
            
        },

        mounted: async function(){
            try {
                const res = await this.$axios.post('project/get-projects', {take: 8, skip: 0, userId: this.$store.state.userIdentity!.id});
                console.log(res.data);    
            }catch(err){
                console.log(err);
            }
        },

        components: {
            Menu,
        },
    });
</script>

<style lang="scss">
    @import '../assets/scss/pages/home.scss';
</style>

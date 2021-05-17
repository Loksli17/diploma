<template>
    <div class="page-project">
        <Menu></Menu>

        <div class="page-wrap">

            <div class="project-buttons-wrap">

            </div>

            <div class="draw-buttons-wrap">

            </div>

            <div class="users-wrap">
                <div class="user" v-for="user in users" :key="user.id" :title="user.firstName + ' ' + user.lastName">
                    <div class="avatar" v-if="!user.avatar.includes('default-user')" :style="{backgroundImage: 'url(' + require(`@/assets/user-avatar/${user.avatar}`) + ')'}"></div>
                    <span v-else>{{user.firstName[0]}} {{user.lastName[0]}}</span>
                </div>
            </div>

            <div class="elems-wrap">

            </div>

            <canvas>
                
            </canvas>
        </div> 
    </div>
</template>


<script lang="ts">
    declare const require: any;
    import {defineComponent} from 'vue';
    import User              from '../types/User';
    import Project           from '../types/Project';


    export default defineComponent({

        data: function(){
            return {
                projectId: 0 as number,
                project  : {} as Project | undefined,
                users    : [] as Array<User>, 
            }
        },

        mounted: async function(){
            this.projectId = Number(this.$route.query.id);
            this.project   = await this.getProject();
            
            if(this.project == undefined) return;

            this.users.push(this.$store.state.userIdentity!);

            if(this.project.users!.length){
                //todo connect to project room socket
                this.$socket.emit('joinProject', {userId: this.$store.state.userIdentity!.id, projectId: this.projectId});
            }

        },

        created: function(){

            this.$socket.on('joinProject', (data: any) => {
                this.users = data.users;
            });

            this.$socket.on('leaveProject', (data: any) => {
                const ind: number = this.users.findIndex(item => item.id == data.id);
                this.users.splice(ind, 1);
            });
        },

        methods: {

            getProject: async function(){
                
                try {
                    const res = await this.$axios.post('/project/get-project', {
                        id: this.projectId,
                    });

                    if(res.status == 200){
                        return res.data.project;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            text: 'Error with query',
                            image: require("@/assets/flash/fail.svg"),
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                        image: require("@/assets/flash/fail.svg"),
                    });
                    console.error(err);
                }
            }
        },
    });
</script>


<style lang="scss">
    @import '../assets/scss/pages/project.scss';
</style>
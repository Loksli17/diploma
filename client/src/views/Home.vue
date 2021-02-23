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
                        <select @change="onFilterChange($event)">
                            <option value="all">All projects</option>
                            <option value="self">My projects</option>
                        </select>
                    </div>

                </div>

                <div class="row">
                    
                </div>

                <div class="row">

                </div>
            </div>

            <div class="aside">
                <div class="row">
                    <button class="btn new-friend-btn"></button>
                    <div><h1>Friends</h1></div>
                </div>

                <div class="row friends-wrap">
                    <div class="friend" v-for="friend in friends" :key='friend.id'>
                        <div>
                            <div class="avatar"> {{friend.avatar}} </div>
                        </div>
                        <div class="">
                            <div class="login">
                                <span>{{friend.login}}</span>
                            </div>
                            <div>
                                <span v-if="friend.status" class="online">online</span>
                                <span v-else class="offline">offline</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <button @click="moreFriendsEvt" class="btn more-friends-btn">More friends</button>
                </div>
            </div>
            
        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    import Menu              from '../components/Menu.vue';
    import Project           from '../types/Project';
    import User              from '../types/User';
    
    export default defineComponent({

        data: function(){
            return {
                friendsRange: 9 as number,
                friendsCount: 0 as number,
                projects    : [] as Array<Project> | undefined,
                friends     : [] as Array<User> | undefined,
            }  
        },

        methods: {

            moreFriendsEvt: async function(){
                const newFriends: Array<User> | undefined = await this.getFriends(this.friendsRange, this.friendsCount);

                if(newFriends == undefined){
                    return;
                }

                this.friends?.concat(newFriends);
                console.log(this.friends);
            },

            // getProjects: function(){

            // },

            getFriends: async function(take: number = 10, skip: number = 0): Promise<Array<User> | undefined> {
                try{
                    const res = await this.$axios.post('user/get-friends', {take: take, skip: skip});
                    if(res.status == 200){
                        this.friendsCount += res.data.friends.length;
                        return res.data.friends;
                    }
                }catch(err){
                    throw new Error(err);
                }
            },

            onFilterChange: function(e: any){
                const filter: string = e.target.value;
                console.log(filter);
            }
        },

        mounted: async function(){
            this.friends = await this.getFriends(this.friendsRange, this.friendsCount);
            console.log(this.friends);
            // try {
            //     const res = await this.$axios.post('project/get-projects', {take: 8, skip: 0, userId: this.$store.state.userIdentity!.id});
            //     if(res.status == 200){
            //         this.projects = res.data.projects;
            //     }
            //     console.log(this.projects);
            // }catch(err){
            //     console.log(err);
            // }
        },

        components: {
            Menu,
        },
    });
</script>

<style lang="scss">
    @import '../assets/scss/pages/home.scss';
</style>

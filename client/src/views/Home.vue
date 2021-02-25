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
                            <option :value="true">All projects</option>
                            <option :value="this.$store.state.userIdentity.id">My projects</option>
                        </select>
                    </div>

                </div>

                <div class="row">

                    <table class="projects-wrap" >
                        <tr>
                            <th>Image</th>
                            <th>Project Name</th>
                            <th>Last modified</th>
                            <th>Author</th>
                            <th>Options</th>
                        </tr>
                        <tbody>
                            <tr v-for="project in projects" :key="project.id">
                                <td></td>
                                <td>{{project.name}}</td>
                                <td>{{project.dateOfEdit}}</td>
                                <td>{{project.author.login}}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                    <Pagination
                        ref="pagination"
                        :take=this.projectRange
                        :currentPage=this.projectCurrentPage
                        :pageSize="4"
                        :amountElements="40"
                    />
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
                            <div class="avatar" :style="{backgroundImage: 'url(' + require(`@/assets/user-avatar/${friend.avatar}`) + ')'}"></div>
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
    import Pagination        from '../components/Pagination.vue';

    
    export default defineComponent({
        data: function(){
            return {
                projectCurrentPage: 2 as number,
                friendsRange      : 9 as number,
                friendsCount      : 0 as number,
                projectsRange     : 6 as number,
                projectsCount     : 0 as number,
                projectsFilter    : true as number | boolean | string,
                projects          : [] as Array<Project> | undefined,
                friends           : [] as Array<User> | undefined,
            }  
        },

        methods: {

            
            getProjects: async function(take: number = 10, skip: number = 0, filter: number | boolean = true): Promise<Array<Project> | undefined> {
                try {
                    const res = await this.$axios.post('project/get-projects', {take: take, skip: skip, userId: this.$store.state.userIdentity!.id, filter: filter});
                    if(res.status == 200){
                        return res.data.projects;
                    }
                }catch(err){
                    console.log(err);
                }
            },

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

            moreFriendsEvt: async function(){
                const newFriends: Array<User> | undefined = await this.getFriends(this.friendsRange, this.friendsCount);

                if(newFriends == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                if(!newFriends.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `You don't have more friends`,
                    });
                }

                this.friends = this.friends?.concat(newFriends);
            },

            onFilterChange: async function(e: any): Promise<void>{
                this.projectsFilter = e.target.value;

                if(this.projectsFilter == '1'){
                    this.projectsFilter = 1;
                }else{
                    this.projectsFilter = true;
                }

                const newProjects: Array<Project> | undefined = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
                
                if(newProjects == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                if(!newProjects.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `You don't have more projects`,
                    });
                }   

                console.log('newProjects', newProjects);

                this.projects = newProjects;
            }
        },

        mounted: async function(){
            this.friends = await this.getFriends(this.friendsRange, this.friendsCount);
            this.projects = await this.getProjects(this.projectsRange, this.projectsCount);
            console.log(this.$router);
        },

        components: {
            Menu,
            Pagination
        },
    });
</script>

<style lang="scss">
    @import '../assets/scss/pages/home.scss';
</style>

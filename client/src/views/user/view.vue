<template>
    <div class="page-user-view" :key="statusPage">
        <Menu ref="globalMenu" v-on:reload-page="reloadPage"></Menu>

        <div class="page-wrap">

            <div class="col-1">

                <div class="col-1-header">
                    <h1>{{pageUser.lastName}} &nbsp;{{pageUser.firstName}} &nbsp;({{pageUser.login}})</h1>
                    <button class="btn del-friend-btn" @click="removeFriendEvt" v-if="friendshipStatus == 1"></button>
                    <button class="btn add-friend-btn" v-if="!friendshipStatus"></button>
                </div>

                <div class="col-1-options">
                    
                    <div class="search-header">
                        <form class="" @submit.prevent="searchProjectsEvt" action="">
                            <div><img :src=" require(`../../assets/search-icon.svg`)"></div>
                            <input v-model="searchValueProject" type="search" placeholder="Project's name">
                        </form>

                        <div>
                            <button class="btn" @click="resetSearch">Clear</button>
                        </div>
                    </div>

                    <div class="select-header">
                        <div><img :src=" require(`../../assets/select-icon.svg`)"></div>
                        <select class="select-header" @change="onFilterChange($event)">
                            <option :value="true">All projects</option>
                            <option :value="this.$store.state.userIdentity.id">My projects</option>
                        </select>
                    </div>

                    <div class="table-btn section-header-btn" :class="{'section-header-active': projectsTableView}" @click="tableViewEvt"><img :src=" require(`../../assets/table-icon.svg`)"></div>

                    <div class="grid-btn section-header-btn" :class="{'section-header-active': projectsGridView}" @click="gridViewEvt"><img :src=" require(`../../assets/grid-icon.svg`)"></div>

                </div>

                <div>
                    <div class="projects-wrap">

                        <div class="projects-grid-wrap" v-if="projectsGridView">
                            
                            <div class="project" v-for="project in projects" :key="project.id" @click.prevent="projectOpenEvt(project)">
                                <div class="project-wrap">

                                    <div class="project-img" :style="{backgroundImage: 'url(' + require(`../../assets/projects/img/${project.image}`)+ ')'}">
                                        
                                    </div>

                                    <div class="project-info">

                                        <div class="name">
                                            <h3>{{project.name}}</h3>
                                        </div>

                                        <div class="edited">
                                            <span>Edited: {{project.dateOfEdit}}</span>
                                        </div>

                                    </div>

                                    <div class="options">
                                        <div class="login">
                                            <span :class="{own: project.isOwn}">{{project.author.login}}</span>
                                        </div>

                                        <a href="" @click.prevent="projectOpenEvt(project)">
                                            <img :src="require('../../assets/view-icon.svg')" draggable="false">
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <table v-if="projectsTableView">
                            <tr>
                                <th>Id</th>
                                <th>Image</th>
                                <th>Project Name</th>
                                <th>Last modified</th>
                                <th>Author</th>
                                <th>Options</th>
                            </tr>
                            <tbody>
                                <tr v-for="project in projects" :key="project.id">
                                    <td>{{project.id}}</td>
                                    <td>
                                        <div :style="{backgroundImage: 'url(' + require(`../../assets/projects/img/${project.image}`)+ ')'}"></div>
                                    </td>
                                    <td>{{project.name}}</td>
                                    <td>{{project.dateOfEdit}}</td>
                                    <td :class="{own: project.isOwn}">{{project.author.login}}</td>
                                    <td class="options">
                                        <div>
                                            <div>
                                                <a href="" @click.prevent="projectOpenEvt(project)">
                                                    <img :src="require('../../assets/view-icon.svg')" draggable="false">
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <Pagination
                        ref="pagination"
                        :take=projectsRange
                        :currentPage=projectCurrentPage
                        :pageSize="6"
                        :endButton="true"
                        :startButton="true"
                        :amountElements=amountProjects
                        v-on:page-change="pageChangeEvt"
                    />
                </div>


            </div>

            <div class="col-2">
                <div> <h1>Friends</h1> </div>
                <div class="friends-wrap">
                    <UserItem v-for="friend in friends" :key="friend.id" 
                        v-bind:user="friend"
                        v-bind:className="'friend'"
                        v-bind:onlineStatus="true"
                        v-bind:items="userContexMenuItems"
                        v-on:reload-page="reloadPage"
                        >
                    </UserItem>
                </div>     

                <div class="button-wrap"><button @click="moreFriendsEvt" class="btn">More friends</button></div>       
            </div>
        </div>

    </div>
</template>

<script lang="ts">
    declare const require: any
    import {defineComponent}        from 'vue';
    import Menu                     from '../../components/Menu.vue';
    import User                     from '../../types/User';
    import UserItem, {MenuUserItem} from '../../components/UserItem.vue';
    import Project                  from '../../types/Project';
    import Pagination               from '../../components/Pagination.vue';

 
    export default defineComponent({
        
        components: {
            Menu,
            UserItem,
            Pagination
        },

        data: function(){
            return {
                projectsTableView: true  as boolean,
                projectsGridView : false as boolean,

                friends     : [] as Array<User> | undefined,
                friendsRange: 9 as number,
                friendsCount: 0 as number,

                projectCurrentPage: 1 as number,
                projectsRange     : 8 as number,
                projectsCount     : 0 as number,
                projectsFilter    : true as number | boolean,
                projects          : [] as Array<Project> | undefined,
                amountProjects    : 0 as number | undefined,
                searchValueProject: "" as string,

                pageUser        : {} as User | undefined,
                friendshipStatus: 0 as number,

                userContexMenuItems: [
                    {value: "View profile", link: "/user/view?id=", img: "view-icon.svg"}, 
                    {value: "Go to chat", link: "/chat?roomId=", img: "chat-icon.svg"}
                ] as Array<MenuUserItem>,

                statusPage: 0 as number,
            }
        },

        methods: {

            initPage: async function(): Promise<void>{
                this.pageUser         = await this.getPageUser();
                this.projects         = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
                this.amountProjects   = await this.getAmountProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
                this.friends          = await this.getFriends(this.friendsRange, this.friendsCount);
                this.friendshipStatus = await this.checkFriends();

                this.friendsCount  = 0;
                this.projectsCount = 0;

                console.log(this.friendshipStatus);
            },

            reloadPage: async function(): Promise<void>{
                this.initPage();
            },

            resetSearch: async function(): Promise<void>{

                const pagination = this.$refs.pagination as any;

                this.searchValueProject  = "";
                pagination.displayStatus = true;
                this.projects            = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
            },

            getFriends: async function(take: number = 10, skip: number = 0): Promise<Array<User> | undefined> {
                try{
                    const res = await this.$axios.post('user/get-friends', {take: take, skip: skip, id: this.$route.query.id});
                    if(res.status == 200){
                        this.friendsCount += res.data.friends.length;
                        return res.data.friends;
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: 'Error with query',
                    });
                    throw new Error(err);
                }
            },

            getAmountProjects: async function(take: number = 10, skip: number = 0, filter: number | boolean = true): Promise<number | undefined> {
                try {
                    const res = await this.$axios.post('project/get-amount-projects', {take: take, skip: skip, userId: this.$route.query.id, filter: filter});
                    if(res.status == 200){
                        return res.data.amount;
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: 'Error with query',
                    });
                    throw new Error(err);
                }
            },

            getProjects: async function(take: number = 10, skip: number = 0, filter: number | boolean = true): Promise<Array<Project> | undefined> {
                try {
                    const res = await this.$axios.post('project/get-projects', {take: take, skip: skip, userId: this.$route.query.id, filter: filter});

                    if(res.status == 200){
                        res.data.projects.forEach((elem: Project) => {
                            elem.dateOfEdit   = this.$filters.datetimeToView(elem.dateOfEdit);
                            elem.dateOfCreate = this.$filters.datetimeToView(elem.dateOfCreate!);
                        });
                        return res.data.projects;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            image: require("../../assets/flash/fail.svg"),
                            text: `Error with query`,
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                        image: require("../../assets/flash/fail.svg"),
                    });
                    throw new Error(err);
                }
            },

            searchProjectsEvt: async function(): Promise<void>{

                const pagination = this.$refs.pagination as any;
                
                if(this.searchValueProject == ""){
                    pagination.displayStatus = true;
                    this.projects            = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter);

                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../../assets/flash/warning.svg"),
                        text: `Input some data`,
                    });

                    return;
                }

                try{
                    const 
                        res = await this.$axios.post('project/search-project', {searchData: this.searchValueProject, userId: this.$store.state.userIdentity!.id}),
                        projects: Array<Project> = res.data.projects;

                    if(!projects.length){
                        this.$flashMessage.show({
                            type: 'warning',
                            image: require("../../assets/flash/warning.svg"),
                            text: `No projects to display`,
                        });
                        return;
                    }

                    this.projects            = projects;
                    pagination.displayStatus = false;
                    // this.amountProjects = 0;
                }catch(err){
                    throw new Error(err);
                }   
            },

            getPageUser: async function(): Promise<User | undefined>{
                try{
                    const res = await this.$axios.post('user/get-id', {id: this.$route.query.id});
                    if(res.status == 200){
                        return res.data.user;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            image: require("../../assets/flash/fail.svg"),
                            text: `Error with query`,
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: 'Error with query',
                    });
                    throw new Error(err);
                }
            },

            moreFriendsEvt: async function(): Promise<void>{

                const newFriends: Array<User> | undefined = await this.getFriends(this.friendsRange, this.friendsCount);

                if(newFriends == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                if(!newFriends.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../../assets/flash/warning.svg"),
                        text: `You don't have more friends`,
                    });
                }

                this.friends = this.friends?.concat(newFriends);
            },

            pageChangeEvt: async function(data: {take: number; skip: number}): Promise<void>{
                const newProjects: Array<Project> | undefined = await this.getProjects(data.take, data.skip, this.projectsFilter);

                if(newProjects == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                if(!newProjects.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../../assets/flash/warning.svg"),
                        text: `You don't have more projects`,
                    });
                    return;
                }``

                this.projects = newProjects;
            },

            onFilterChange: async function(e: any): Promise<void>{

                if(e.target.value == '1'){
                    this.projectsFilter = 1;
                }else{
                    this.projectsFilter = true;
                }

                const 
                    newProjects: Array<Project> | undefined = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter),
                    amountProjects: number | undefined      = await this.getAmountProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
                
                if(newProjects == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                if(!newProjects.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../../assets/flash/warning.svg"),
                        text: `You don't have more projects`,
                    });
                    return;
                }

                if(amountProjects == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                this.projects       = newProjects;
                this.amountProjects = amountProjects;
            },

            tableViewEvt: function(): void{
                this.projectsTableView  = true;
                this.projectsGridView   = false;
            },

            gridViewEvt: async function(){
                this.projectsTableView  = false;
                this.projectsGridView   = true;
            },


            /*
                @return 
                    2 - identity user = view user
                    1 - friendship
                    0 - no friendship
            */

            checkFriends: async function(): Promise<number>{

                if(this.$store.state.userIdentity!.id === Number(this.$route.query.id)){
                    return 2;
                }
                
                try {
                    const res = await this.$axios.post('/user/check-friends', {userId1: this.$store.state.userIdentity!.id, userId2: this.$route.query.id});

                    if(res.status == 200){
                        return res.data.friendshipStatus;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            image: require("../../assets/flash/fail.svg"),
                            text: `Error with query`,
                        });
                        throw new Error();
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    throw new Error(err);
                }
            },


            removeFriendEvt: async function(): Promise<void>{
                try {
                    const res = await this.$axios.post('/user/remove-friends', {currentUserId: this.$store.state.userIdentity!.id, friendId: this.$route.query.id});

                    if(res.status == 200){
                        this.$flashMessage.show({
                            type: 'success',
                            image: require("../../assets/flash/success.svg"),
                            text: `User ${this.pageUser!.login} was removed from your friend list` ,
                        });
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            image: require("../../assets/flash/fail.svg"),
                            text: `Error with query`,
                        });
                        throw new Error();
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    throw new Error(err);
                }
            },

            projectOpenEvt: function(project: Project): void{
                console.log(project)
                const menu = this.$refs.globalMenu! as any;
                menu.addTab(project);
            }
        },

        mounted: async function(){
            this.initPage();
        },
        
    });
</script>

<style lang="scss">
    @import '../../assets/scss/pages/user/view.scss';
</style>
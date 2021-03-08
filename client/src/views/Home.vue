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
                        <form action="" @submit.prevent="searchProjectsEvt">
                            <input v-model="searchValue" type="search">
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
                                    <div :style="{backgroundImage: 'url(' + require(`../assets/projects/img/${project.image}`)+ ')'}"></div>
                                </td>
                                <td>{{project.name}}</td>
                                <td>{{project.dateOfEdit}}</td>
                                <td>{{project.author.login}}</td>
                                <td>
                                    <div>
                                        <div>
                                            <a href="" @click.prevent="projectViewEvt(project.id)">
                                                <img :src="require('../assets/view-icon.svg')" alt="">
                                            </a>
                                        </div>
                                        <div>
                                            <a href="" @click.prevent="projectEditEvt">
                                                <img :src="require('../assets/edit-icon.svg')" alt="">
                                            </a>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="row">
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
        
        <ActionBack ref="actionBackView" v-bind:headerMainText="projectView.name" v-bind:headerAddText="`View`">
            <div class="project-view">

                <div class="col-1">
                    <div class="row">
                        <div :style="{backgroundImage: 'url(' + require(`@/assets/projects/img/${projectView.image}`) + ')'}" class="project-img"></div>
                    </div>

                    <div class="row">
                        
                        <div class="wrap-header">
                            <h2>Information</h2>
                        </div>
                        
                        <table class="project-grid-view">
                            <tr>
                                <td>Name</td>
                                <td>{{projectView.name}}</td>
                            </tr>
                            <tr>
                                <td>Author</td>
                                <td>{{projectView.author.login}}</td>
                            </tr>
                            <tr>
                                <td>Date of creation</td>
                                <td>{{projectView.dateOfCreate}}</td>
                            </tr>
                            <tr>
                                <td>Last modified</td>
                                <td>{{projectView.dateOfEdit}}</td>
                            </tr>
                            <tr>
                                <td>View status</td>
                                <td>{{projectView.viewStatus.name}}</td>
                            </tr>
                        </table>
                        <button class="btn" @click="projectEditEvt(projectView.id)">Edit data</button>
                    </div>

                    <div class="row">
                        <div class="coll-header">
                            <h2>Collaborators ({{projectViewCollabs.length}}/10)</h2>
                            <button class="btn"><span></span></button>
                        </div>

                        <div class="collaborators-wrap">
                            <template v-for="collaborator in projectViewCollabs" :key="collaborator.id">
                                <div class="collaborator">
                                    <div class="avatar" :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${collaborator.avatar}`)+ ')'}"></div>
                                    <div>
                                        {{collaborator.firstName}} {{collaborator.lastName}}
                                    </div>
                                    <div class="close">
                                        <span></span>
                                    </div>
                                </div>
                            </template>
                        </div>

                    </div>
                </div>
                
                <div class="col-2">
                    <button class="btn btn-error">Delete</button>
                </div>

            </div>
        </ActionBack>

        <ActionBack ref="actionBackEdit" v-bind:headerMainText="projectView.name" v-bind:headerAddText="`Edit`">
            <Form
                v-bind:rows="rowsEditProjectForm"
                v-bind:action="'/project/edit'"
                v-bind:className="'edit-project-form form'"
                v-bind:successCode="201"
                v-bind:overloadParseResult="true"
                v-on:result-parser="editProjectFormResultParser"
            />
        </ActionBack>
    </div>
</template>


<script lang="ts">
    import {defineComponent} from 'vue';
    import Menu              from '../components/Menu.vue';
    import Project           from '../types/Project';
    import User              from '../types/User';
    import Pagination        from '../components/Pagination.vue';
    import ActionBack        from '../components/ActionBack.vue';
    import Form, {FormItem}  from '../components/Form.vue';

    
    export default defineComponent({

        data: function(){
            return {
                friends           : [] as Array<User> | undefined,
                friendsRange      : 9 as number,
                friendsCount      : 0 as number,
                
                projectCurrentPage: 1 as number,
                projectsRange     : 9 as number,
                projectsCount     : 0 as number,
                projectsFilter    : true as number | boolean,
                projects          : [] as Array<Project> | undefined,
                
                amountProjects    : 0 as number | undefined,
                amountFriends     : 0 as number | undefined,
                
                searchValue       : "" as string,

                //project view
                projectView       : {} as Project | undefined,
                projectViewCollabs: [] as Array<User> | undefined,

                rowsEditProjectForm: [
                    [{type: 'text', name: 'name', label: 'Name', value: 'Name'}],
                    [{type: 'select', name: 'view Status', options: [{id: 1, text: 'Public'}, {id: '2', text: 'Private'}], selected: 'Public'}],
                    [{type: 'submit', name: 'submit', value: 'Edit project'}]
                ] as Array<Array<FormItem>>
            }  
        },

        methods: {
            
            getProjects: async function(take: number = 10, skip: number = 0, filter: number | boolean = true): Promise<Array<Project> | undefined> {
                try {
                    const res = await this.$axios.post('project/get-projects', {take: take, skip: skip, userId: this.$store.state.userIdentity!.id, filter: filter});
                    if(res.status == 200){
                        res.data.projects.forEach((elem: Project) => {
                            elem.dateOfEdit   = this.$filters.datetimeToView(elem.dateOfEdit);
                            elem.dateOfCreate = this.$filters.datetimeToView(elem.dateOfCreate!);
                        });
                        return res.data.projects;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            // image: require("../../assets/flashMessage/fail.svg"),
                            text: `Error with query`,
                        });
                    }
                }catch(err){
                    throw new Error(err);
                }
            },

            getAmountProjects: async function(take: number = 10, skip: number = 0, filter: number | boolean = true): Promise<number | undefined> {
                try {
                    const res = await this.$axios.post('project/get-amount-projects', {take: take, skip: skip, userId: this.$store.state.userIdentity!.id, filter: filter});
                    if(res.status == 200){
                        return res.data.amount;
                    }
                }catch(err){
                    throw new Error(err);
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

            pageChangeEvt: async function(data: {take: number; skip: number}){
                const newProjects: Array<Project> | undefined = await this.getProjects(data.take, data.skip, this.projectsFilter);

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
                    return;
                }

                this.projects = newProjects;
            },

            searchProjectsEvt: async function(e: any){
                
                if(this.searchValue == ""){
                    this.$flashMessage.show({
                        type: 'warning',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `Input some data`,
                    });
                    return;
                }

                const 
                    res = await this.$axios.post('project/search-project', {searchData: this.searchValue, userId: this.$store.state.userIdentity!.id}),
                    projects: Array<Project> = res.data.projects;

                if(!projects.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `No projects to display`,
                    });
                    return;
                }

                this.projects = projects;
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
                    return;
                }

                if(amountProjects == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                this.projects       = newProjects;
                this.amountProjects = amountProjects;
            },


            
            projectViewEvt: async function(id: number){
                const background = this.$refs.actionBackView! as any;
                let collaborators: Array<User> = [];
                
                this.projectView = this.projects!.find((project) => project.id === id);

                if(this.projectView == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `Unexpected error`,
                    });
                }
                
                try {
                    const res = await this.$axios.post('project/get-collaborators', {id: id});
                    if(res.status == 200){
                        collaborators = res.data.collaborators;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            // image: require("../../assets/flashMessage/fail.svg"),
                            text: `Error with query`,
                        });
                    }
                }catch(err){
                    throw new Error(err);
                }
                
                this.projectViewCollabs = collaborators;

                background.show();
            },

            projectEditEvt: async function(id: number){

                const 
                    backView = this.$refs.actionBackView! as any,
                    backEdit = this.$refs.actionBackEdit! as any;
                
                backView.hide();
                backEdit.show();

                this.rowsEditProjectForm[0][0].value = this.projectView!.name;
            }
        },


        mounted: async function(){
            this.friends        = await this.getFriends(this.friendsRange, this.friendsCount);
            this.projects       = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter)
            this.amountProjects = await this.getAmountProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
        },

        components: {
            Menu,
            Pagination,
            ActionBack,
            Form,
        },
    });
</script>

<style lang="scss">
    @import '../assets/scss/pages/home.scss';
</style>

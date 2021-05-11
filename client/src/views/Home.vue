<template>
    <div class="page-home">
        <Menu ref="globalMenu"></Menu>
        
        <div class="page-wrap">

            <div class="section">
                <div class="row section-header">
                    
                    <div class="col-2">
                        <button class="btn new-project-btn" @click="newProjectEvt">
                            <span></span>
                            <span>New project</span>
                        </button>
                    </div>

                    <div class="search-header">
                        <form class="" action="" @submit.prevent="searchProjectsEvt">
                            <div><img :src=" require(`../assets/search-icon.svg`)"></div>
                            <input v-model="searchValueProject" type="search" placeholder="Project's name">
                        </form>
                    </div>

                    <div class="select-header">
                        <div><img :src=" require(`../assets/select-icon.svg`)"></div>
                        <select class="select-header" @change="onFilterChange($event)">
                            <option :value="true">All projects</option>
                            <option :value="this.$store.state.userIdentity.id">My projects</option>
                        </select>
                    </div>

                    <div class="table-btn section-header-btn" :class="{'section-header-active': projectsTableView}" @click="tableViewEvt"><img :src=" require(`../assets/table-icon.svg`)"></div>

                    <div class="grid-btn section-header-btn" :class="{'section-header-active': projectsGridView}" @click="gridViewEvt"><img :src=" require(`../assets/grid-icon.svg`)"></div>

                </div>

                <div class="row">

                    <div class="projects-wrap">

                        <div class="projects-grid-wrap" v-if="projectsGridView">
                            
                            <div class="project" v-for="project in projects" :key="project.id" @click.prevent="projectOpenEvt(project)">
                                <div class="project-wrap">

                                    <div class="project-img" :style="{backgroundImage: 'url(' + require(`../assets/projects/img/${project.image}`)+ ')'}">
                                        
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
                                        
                                        <a href="" @click.prevent="projectViewEvt(project.id)">
                                            <img :src="require('../assets/settings-icon.svg')" draggable="false">
                                        </a>
                                        
                                        <a href="" @click.prevent="projectOpenEvt(project)">
                                            <img :src="require('../assets/view-icon.svg')" draggable="false">
                                        </a>

                                        <a href="" @click.prevent="projectEditEvt(project.id)">
                                            <img :src="require('../assets/edit-icon.svg')" draggable="false">
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
                                        <div :style="{backgroundImage: 'url(' + require(`../assets/projects/img/${project.image}`)+ ')'}"></div>
                                    </td>
                                    <td>{{project.name}}</td>
                                    <td>{{project.dateOfEdit}}</td>
                                    <td :class="{own: project.isOwn}">{{project.author.login}}</td>
                                    <td class="options">
                                        <div>
                                            <div>
                                                <a href="" @click.prevent="projectViewEvt(project.id)">
                                                    <img :src="require('../assets/settings-icon.svg')" draggable="false">
                                                </a>
                                            </div>
                                            
                                            <div>
                                                <a href="" @click.prevent="projectOpenEvt(project)">
                                                    <img :src="require('../assets/view-icon.svg')" draggable="false">
                                                </a>
                                            </div>

                                            <div>
                                                <a href="" @click.prevent="projectEditEvt(project.id)">
                                                    <img :src="require('../assets/edit-icon.svg')" draggable="false">
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    
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
                    <router-link to="/user/addFriends">
                        <button class="btn new-friend-btn"></button>
                    </router-link>
                    <div><h1>Friends</h1></div>
                </div>

                <div class="row friends-wrap">
                    <UserItem v-for="friend in friends" :key="friend.id" 
                        v-bind:user="friend"
                        v-bind:className="'friend'"
                        v-bind:onlineStatus="true"
                        v-bind:items="userContexMenuItems"
                        >
                    </UserItem>
                </div>

                <div class="row">
                    <button @click="moreFriendsEvt" class="btn more-friends-btn">More friends</button>
                </div>
            </div>
            
        </div>
        
        <ActionBack 
            ref="actionBackView" 
            v-bind:headerMainText="projectView.name" 
            v-bind:headerAddText="`View`" 
            >
            
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
                            <button class="btn" @click="addCollaboratorsShowBack"><span></span></button>
                        </div>

                        <div class="collaborators-wrap">
                            <template v-for="(collaborator, ind) in projectViewCollabs" :key="collaborator.id">
                                <div class="collaborator">
                                    <div class="avatar" :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${collaborator.avatar}`)+ ')'}"></div>
                                    <div>
                                        {{collaborator.firstName}} {{collaborator.lastName}}
                                    </div>
                                    <div class="close" @click="removeCollaborator(ind)">&#10006;</div>
                                </div>
                            </template>
                        </div>

                    </div>
                </div>
                
                <div class="col-2">
                    <button class="btn btn-error" @click="projectDeleteEvt(projectView.id)">Delete</button>
                </div>

            </div>
        </ActionBack>

        <ActionBack 
            ref="actionBackEdit" 
            v-bind:headerMainText="projectView.name" 
            v-bind:headerAddText="`Edit`" 
            v-bind:backButton="true"
            v-on:go-view="goViewEvt"
            >

            <Form
                v-bind:rows="rowsEditProjectForm"
                v-bind:action="'/project/edit'"
                v-bind:className="'edit-project-form form'"
                v-bind:successCode="201"
                v-bind:tableName="'project'"
                v-bind:overloadParseResult="true"
                v-on:result-parser="editProjectFormResultParser"
            />
        </ActionBack>

        <ActionBack ref="actionBackAdd" v-bind:headerMainText="'Project'" v-bind:headerAddText="`Add`">
            <Form
                v-bind:rows="rowsAddProjectForm"
                v-bind:action="'/project/add'"
                v-bind:className="'add-project-form form'"
                v-bind:successCode="201"
                v-bind:tableName="'project'"
                v-bind:overloadParseResult="true"
                v-on:result-parser="addProjectFormResultParser"
            />
        </ActionBack>

        <ActionBack 
            ref="actionBackCollaborators" 
            v-bind:headerMainText="projectView.name" 
            v-bind:headerAddText="`Add collaborators`" 
            v-bind:overloadCloseEvt="true"
            v-bind:backButton="true"
            v-on:go-view="goViewEvt"
            v-on:close-back="clearAllCollaborators">
            
            <div class="action-add-wrap">
                <div class="row-1">

                    <form class="search-collaborators" action="" @submit.prevent="searchUsersEvt">
                        <div><img :src=" require(`../assets/search-icon.svg`)"></div>
                        <input v-model="searchValueUser" type="search" placeholder="Input e-mail or login here..">
                    </form>

                    <div class="btn small-btn" @click="clearSearchCollaboratorsResult">Clear search</div>

                    <div class="btn small-btn" @click="clearPotentialCollaboratorsResult">Clear potential</div>
                    
                </div>

                <div class="row-2">
                    <div>
                        <h3>Result of search</h3>
                    </div>

                    <div>
                        <h3>Potential collaborators</h3>
                    </div>
                </div>

                <div class="row-3">
                    <draggable :list="searchCollabsRes" group="users" class="search-result-wrap" @change="log" >
                        <div class="user" :id="user.id" v-for="user in searchCollabsRes" :key="user.id">
                            <div :style="{backgroundImage: 'url(' + require(`@/assets/user-avatar/${user.avatar}`) + ')'}" class="avatar"></div>
                            <div class="name">{{user.firstName}}{{user.lastName}} ({{user.login}})</div>
                        </div>
                    </draggable>

                    <draggable :list="newCollabs" group="users" class="new-users" @change="log">
                        <div class="user" :id="user.id" v-for="user in newCollabs" :key="user.id">
                            <div :style="{backgroundImage: 'url(' + require(`@/assets/user-avatar/${user.avatar}`) + ')'}" class="avatar"></div>
                            <div class="name">{{user.firstName}}{{user.lastName}} ({{user.login}})</div>
                        </div>
                    </draggable>
                </div>

                <div class="row-4">
                    <button class="btn" @click="addCollaboratorsEvt(projectView.id)">Add collaborators</button>
                </div>
            </div>
        </ActionBack>
    </div>
</template>


<script lang="ts">
    declare const require: any;
    import {defineComponent}        from 'vue';
    import Project                  from '../types/Project';
    import User                     from '../types/User';
    import Pagination               from '../components/Pagination.vue';
    import ActionBack               from '../components/ActionBack.vue';
    import Form, {FormItem, Option} from '../components/Form.vue';
    import {VueDraggableNext}       from 'vue-draggable-next';
    import UserItem, {MenuUserItem} from '../components/UserItem.vue';
import Notification from '../types/Notification';
    

    export default defineComponent({

        data: function(){
            return {

                projectsTableView: true  as boolean,
                projectsGridView : false as boolean,

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
                
                searchValueProject: "" as string,
                searchValueUser   : "" as string,

                //project view
                projectView       : {} as Project | undefined,
                projectViewCollabs: [] as Array<User> | undefined,
                searchCollabsRes  : [] as Array<User> | undefined,
                newCollabs        : [] as Array<User> | undefined,

                rowsEditProjectForm: [
                    [{type: 'text', name: 'name', label: 'Name', value: 'Name'}, {type: 'hidden', name: 'id', value: 1}],
                    [{type: 'select', name: 'viewStatusId', options: [{id: 1, text: 'Public'}, {id: '2', text: 'Private'}], selected: 1}],
                    [{type: 'submit', name: 'submit', value: 'Edit project'}]
                ] as Array<Array<FormItem>>,

                rowsAddProjectForm: [
                    [{type: 'text', name: 'name', label: 'Name', value: 'Name'}, {type: 'hidden', name: 'authorId', value: 1}],
                    [{type: 'select', name: 'viewStatusId', options: [{id: 1, text: 'Public'}, {id: '2', text: 'Private'}], selected: 1}],
                    [{type: 'submit', name: 'submit', value: 'Add new project'}]
                ] as Array<Array<FormItem>>,

                enabled : true,
                dragging: false,

                userContexMenuItems: [
                    {value: "View profile", link: "/user/view?id=", img: "view-icon.svg"},
                    {value: "Go to chat", link: "/chat?idUserReceive=", img: "chat-icon.svg"}, 
                    {value: "Remove form friends", link: "", img: "remove-icon.svg"},
                ] as Array<MenuUserItem>,
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
                            image: require("../assets/flash/fail.svg"),
                            text: `Error with query`,
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                        image: require("../assets/flash/fail.svg"),
                    });
                    throw new Error(err);
                }
            },


            getAmountProjects: async function(filter: number | boolean = true): Promise<number | undefined> {
                try {
                    const res = await this.$axios.post('project/get-amount-projects', {userId: this.$store.state.userIdentity!.id, filter: filter});
                    if(res.status == 200){
                        return res.data.amount;
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: 'Error with query',
                    });
                    throw new Error(err);
                }
            },


            getFriends: async function(take: number = 10, skip: number = 0, id: number = 1): Promise<Array<User> | undefined> {
                try{
                    const res = await this.$axios.post('user/get-friends', {take: take, skip: skip, id: id});
                    if(res.status == 200){
                        this.friendsCount += res.data.friends.length;
                        return res.data.friends;
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: 'Error with query',
                    });
                    throw new Error(err);
                }
            },


            moreFriendsEvt: async function(){
                const newFriends: Array<User> | undefined = await this.getFriends(this.friendsRange, this.friendsCount);

                if(newFriends == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                if(!newFriends.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
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
                        image: require("../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                if(!newProjects.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `You don't have more projects`,
                    });
                    return;
                }``

                this.projects = newProjects;
            },

           
           searchProjectsEvt: async function(e: any){
                
                if(this.searchValueProject == ""){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
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
                            image: require("../assets/flash/warning.svg"),
                            text: `No projects to display`,
                        });
                        return;
                    }

                    this.projects = projects;
                    this.amountProjects = 0;
                }catch(err){
                    throw new Error(err);
                }   
            },


            onFilterChange: async function(e: any): Promise<void>{

                if(e.target.value == '1'){
                    this.projectsFilter = 1;
                }else{
                    this.projectsFilter = true;
                }

                const 
                    newProjects: Array<Project> | undefined = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter),
                    amountProjects: number | undefined      = await this.getAmountProjects(this.projectsFilter);
                
                if(newProjects == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                if(!newProjects.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `You don't have more projects`,
                    });
                    return;
                }

                if(amountProjects == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                this.projects       = newProjects;
                this.amountProjects = amountProjects;
            },


            goViewEvt: function(){
                const 
                    backView    = this.$refs.actionBackView! as any,
                    backAddColl = this.$refs.actionBackCollaborators! as any,
                    backEdit    = this.$refs.actionBackEdit! as any;
                
                backAddColl.hide();
                backEdit.hide();
                backView.show();
            },


            newProjectEvt: function(res: any){
                const backAdd = this.$refs.actionBackAdd! as any;
                backAdd.show();
            },


            addProjectFormResultParser: async function(res: any){

                const backAdd = this.$refs.actionBackAdd! as any;

                if(res.status == 400 && res.data.msg != "Bad validation"){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: res.data.msg,
                    });
                    return;
                }else if(res.status == 400 && res.data.msg == "Bad validation"){
                    return;
                }

                backAdd.hide();

                if(res.status == 201){
                    this.projects = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
                    this.amountProjects!++;

                    this.$flashMessage.show({
                        type: 'success',
                        image: require("../assets/flash/success.svg"),
                        text: res.data.msg,
                    });
                    return;
                }
            },
            

            projectViewEvt: async function(id: number){
                const background = this.$refs.actionBackView! as any;
                let collaborators: Array<User> = [];
                
                this.projectView = this.projects!.find((project) => project.id === id);

                if(this.projectView == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
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
                            image: require("../assets/flash/fail.svg"),
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

                this.projectView = this.projects!.find((project) => project.id === id);

                if(this.projectView == undefined){
                    return;
                }

                if(this.projectView.isOwn == undefined || !this.projectView.isOwn){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `You cannot edit this projects`,
                    });
                    return;
                }

                const 
                    backView = this.$refs.actionBackView! as any,
                    backEdit = this.$refs.actionBackEdit! as any;
                
                backView.hide();
                backEdit.show();

                this.rowsEditProjectForm[0][0].value    = this.projectView!.name;
                this.rowsEditProjectForm[0][1].value    = Number(this.projectView!.id);
                this.rowsEditProjectForm[1][0].selected = this.projectView!.viewStatus.id;
            },


            editProjectFormResultParser: function(res: any){

                if(this.projects == undefined){
                    return;
                }

                if(res.status == 400){
                    this.$flashMessage.show({
                        type: 'error',
                        text: res.data.msg,
                    });
                    return;
                }

                if(res.status == 201){
                    
                    const index: number = this.projects.findIndex((project) => project.id === res.data.project.id);
                   
                    this.projectView = res.data.project;
                    this.projects.splice(index, 1, res.data.project);

                    res.data.project.dateOfEdit   = this.$filters.datetimeToView(res.data.project.dateOfEdit);
                    res.data.project.dateOfCreate = this.$filters.datetimeToView(res.data.project.dateOfCreate!);

                    this.$flashMessage.show({
                        type: 'success',
                        image: require("../assets/flash/success.svg"),
                        text: res.data.msg,
                    });
                }
            },


            projectDeleteEvt: async function(id: number){

                const backView: any = this.$refs.actionBackView! as any;

                this.projectView = this.projects!.find((project) => project.id === id);

                if(this.projectView == undefined){
                    return;
                }

                if(this.projectView.isOwn == undefined || !this.projectView.isOwn){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `You cannot delete this project`,
                    });
                    return;
                }

                try {
                    const res: any = await this.$axios.post('project/delete', {id: id, userSend: this.$store.state.userIdentity!});

                    if(res.status === 400){
                        this.$flashMessage.show({
                            image: require("../assets/flash/fail.svg"),
                            type: 'error',
                            text: res.data.msg,
                        });
                        return;
                    }

                    if(res.status === 200){
                        backView.hide();

                        this.amountProjects!--;
                        this.projects = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter);

                        console.log({userIds: res.data.userIds, notifications: res.data.notifications})

                        this.$socket.emit('manyNotifications', {userIds: res.data.userIds, notifications: res.data.notifications});

                        this.$flashMessage.show({
                            type: 'success',
                            image: require("../assets/flash/success.svg"),
                            text: res.data.msg,
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'success',
                        image: require("../assets/flash/success.svg"),
                        text: 'Error with query',
                    });
                }
                    
            },


            addCollaboratorsShowBack: function(){

                if(this.projectView == undefined){
                    return;
                }
                
                if(this.projectView.isOwn == undefined || !this.projectView.isOwn){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `You cannot add collaborators is this project`,
                    });
                    return;
                }

                const
                    backView: any    = this.$refs.actionBackView! as any,  
                    backAddColl: any = this.$refs.actionBackCollaborators as any;

                backAddColl.show();
                backView.hide();
            },


            searchUsersEvt: async function(){

                if(this.searchValueUser == ""){
                    this.searchCollabsRes = [];
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `Input some data`,
                    });
                    return;
                }

                const collabsIds: Array<number> = [];

                let
                    res: any,
                    users: Array<User> = [];

                this.projectViewCollabs!.forEach((elem) => {
                    collabsIds.push(elem.id);
                });

                this.newCollabs!.forEach((elem) => {
                    collabsIds.push(elem.id);
                });

                collabsIds.push(this.$store.state.userIdentity!.id);

                try {
                    res = await this.$axios.post('user/search-collaborators', {searchData: this.searchValueUser, authUserId: this.$store.state.userIdentity!.id, collabsIds: collabsIds});
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: 'Error with query',
                    });
                }
                
                if(res.status === 400){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: res.data.msg,
                    });
                    return;
                }

                users = res.data.users;

                if(!users.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `No users to display`,
                    });
                }

                this.searchCollabsRes = users;
            },


            addCollaboratorsEvt: async function(id: number){
                                
                if(!this.newCollabs!.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `At first, add new collaborators`,
                    });
                    return;
                }

                const collabsIds: Array<number> = [];

                this.newCollabs!.forEach((elem) => {
                    collabsIds.push(elem.id);
                });

                try {

                    const res: any = await this.$axios.post('project/add-collaborators', {
                        usersIds: collabsIds, 
                        id      : this.projectView!.id,
                        userSend: this.$store.state.userIdentity!,
                    });

                    if(res.status == 400){
                        this.$flashMessage.show({
                            type: 'warning',
                            image: require("../assets/flash/warning.svg"),
                            text: res.data.msg,
                        });
                        return;
                    }

                    //* successfull part
                    
                    this.newCollabs!.forEach((elem) => {
                        this.projectViewCollabs!.push(elem);
                    });

                    this.newCollabs = [];

                    if(!this.newCollabs!.length){
                        this.$flashMessage.show({
                            type: 'success',
                            image: require("../assets/flash/success.svg"),
                            text: res.data.msg,
                        });

                        this.$socket.emit('manyNotifications', {
                            userIds      : collabsIds,
                            notifications: res.data.notifications
                        });

                        return;
                    }
                    
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;               
                }
            },


            clearPotentialCollaboratorsResult: function(){
                this.newCollabs = [];
                this.searchUsersEvt();
            },

            clearSearchCollaboratorsResult: function(){
                this.searchValueUser  = "";
                this.searchCollabsRes = [];
            },

            clearAllCollaborators: function(){
                this.newCollabs       = [];
                this.searchValueUser  = "";
                this.searchCollabsRes = [];
            },

            removeCollaborator: async function(ind: number){
                
                if(this.projectViewCollabs == undefined || !this.projectViewCollabs.length || this.projectView == undefined){
                    return;
                }

                if(this.projectView.isOwn == undefined || !this.projectView.isOwn){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `You cannot add collaborators is this project`,
                    });
                    return;
                }

                try {
                    const res: any = await this.$axios.post('project/remove-collaborator', {
                        userId   : this.projectViewCollabs[ind].id,
                        projectId: this.projectView.id,
                        userSend : this.$store.state.userIdentity!, 
                    });

                    if(res.status == 400){
                        this.$flashMessage.show({
                            type: 'error',
                            image: require("../assets/flash/fail.svg"),
                            text: res.data.msg,
                        });
                        return;  
                    }

                    this.$socket.emit('notification', {userReceiveId: this.projectViewCollabs[ind].id, notification: res.data.notification});

                    this.projectViewCollabs.splice(ind, 1);

                    this.$flashMessage.show({
                        type: 'success',
                        image: require("../assets/flash/success.svg"),
                        text: res.data.msg,
                    });
                }catch(err){
                    console.error(err);
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: `Error with query`,
                    }); 
                }
            },


            tableViewEvt: async function(){
                this.projectsTableView  = true;
                this.projectsGridView   = false;
            },

            gridViewEvt: async function(){
                this.projectsTableView  = false;
                this.projectsGridView   = true;
            },

            projectOpenEvt: function(project: Project): void{
                const menu = this.$refs.globalMenu! as any;
                menu.addTab(project);
            }
        },


        mounted: async function(){
            this.friends        = await this.getFriends(this.friendsRange, this.friendsCount, this.$store.state.userIdentity!.id);
            this.projects       = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
            this.amountProjects = await this.getAmountProjects(this.projectsFilter);
        },


        created: async function(){
            
            const viewStatusElements: Array<Option> = [];

            try {
                const res = await this.$axios.post('project/get-view-status');
                
                if(res.status == 200){
                    res.data.viewStatusElements.forEach((elem: any) => {
                        viewStatusElements.push({text: elem.name, id: elem.id});
                    });
                }else{
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                }  
            }catch(err){
                throw new Error(err);
            }
            
            this.rowsEditProjectForm[1][0].options  = viewStatusElements;
            this.rowsEditProjectForm[1][0].selected = viewStatusElements[0].id;

            this.$socket.on('notification', (data: any) => {

                if(data.notification.typeNotification.id != 2){
                    return;
                }

                this.friends = this.friends!.filter((item) => {
                    if(item.id != data.notification.userSendId) return item;
                });

            });
        },

        components: {
            // Menu,
            Pagination,
            ActionBack,
            Form,
            draggable: VueDraggableNext,
            UserItem,
        },
    });
</script>

<style lang="scss">
    @import '../assets/scss/pages/home.scss';
</style>

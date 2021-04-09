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
                            <input v-model="searchValueProject" type="search">
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
                                            <a href="" @click.prevent="projectEditEvt(project.id)">
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

        <ActionBack ref="actionBackEdit" v-bind:headerMainText="projectView.name" v-bind:headerAddText="`Edit`">
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
            v-on:close-back="clearAllCollaborators">
            
            <div class="action-add-wrap">
                <div class="row-1">
                    <form action="" @submit.prevent="searchUsersEvt">
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
    import {defineComponent}        from 'vue';
    import Menu                     from '../components/Menu.vue';
    import Project                  from '../types/Project';
    import User                     from '../types/User';
    import Pagination               from '../components/Pagination.vue';
    import ActionBack               from '../components/ActionBack.vue';
    import Form, {FormItem, Option} from '../components/Form.vue';
    import {VueDraggableNext}       from 'vue-draggable-next'

    
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
            }  
        },

        methods: {

            log(event: any) {
                console.log(event)
            },
            
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

            //!! insert id of ideentity user in query!!
            searchProjectsEvt: async function(e: any){
                
                if(this.searchValueProject == ""){
                    this.$flashMessage.show({
                        type: 'warning',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `Input some data`,
                    });
                    return;
                }

                const 
                    res = await this.$axios.post('project/search-project', {searchData: this.searchValueProject, userId: this.$store.state.userIdentity!.id}),
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

            newProjectEvt: function(res: any){
                const backAdd = this.$refs.actionBackAdd! as any;
                backAdd.show();
            },

            addProjectFormResultParser: async function(res: any){

                const backAdd = this.$refs.actionBackAdd! as any;

                if(res.status == 400 && res.data.msg != "Bad validation"){
                    this.$flashMessage.show({
                        type: 'error',
                        text: res.data.msg,
                    });
                    return;
                }else if(res.status == 400 && res.data.msg == "Bad validation"){
                    return;
                }

                backAdd.hide();

                if(res.status == 201){
                    this.projects = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
                    this.$flashMessage.show({
                        type: 'success',
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

                this.projectView = this.projects!.find((project) => project.id === id);

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

                if(res.status == 400){
                    this.$flashMessage.show({
                        type: 'error',
                        text: res.data.msg,
                    });
                    return;
                }

                if(res.status == 201){
                    const index: number = this.projects!.findIndex((project) => project.id === res.data.project.id);
                    
                    this.projectView = res.data.project;
                    // this.$set(this.projects, index, res.data.project);

                    this.$flashMessage.show({
                        type: 'success',
                        text: res.data.msg,
                    });
                }
            },

            projectDeleteEvt: async function(id: number){

                const
                    backView: any = this.$refs.actionBackView! as any, 
                    res: any      = await this.$axios.post('project/delete', {id: id});

                if(res.status === 400){
                    this.$flashMessage.show({
                        type: 'error',
                        text: res.data.msg,
                    });
                    return;
                }

                if(res.status === 200){
                    backView.hide();
                    this.projects = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
                    this.$flashMessage.show({
                        type: 'success',
                        text: res.data.msg,
                    });
                }

            },

            addCollaboratorsShowBack: function(){

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
                        // image: require("../../assets/flashMessage/fail.svg"),
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

                try {
                    res = await this.$axios.post('user/search-collaborators', {searchData: this.searchValueUser, authUserId: this.$store.state.userIdentity!.id, collabsIds: collabsIds});
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                    });
                }
                
                if(res.status === 400){
                    this.$flashMessage.show({
                        type: 'error',
                        text: res.data.msg,
                    });
                    return;
                }

                users = res.data.users;

                if(!users.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `No users to display`,
                    });
                }

                this.searchCollabsRes = users;
            },

            addCollaboratorsEvt: async function(id: number){

                if(!this.newCollabs!.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        // image: require("../../assets/flashMessage/fail.svg"),
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
                        id      : this.projectView!.id
                    });

                    if(res.status == 400){
                        this.$flashMessage.show({
                            type: 'warning',
                            // image: require("../../assets/flashMessage/fail.svg"),
                            text: res.data.msg,
                        });
                        return;
                    }
                    
                    this.newCollabs!.forEach((elem) => {
                        this.projectViewCollabs!.push(elem);
                    });
                    this.newCollabs = [];

                    if(!this.newCollabs!.length){
                        this.$flashMessage.show({
                            type: 'success',
                            // image: require("../../assets/flashMessage/fail.svg"),
                            text: res.data.msg,
                        });
                        return;
                    }
                    
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        // image: require("../../assets/flashMessage/fail.svg"),
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

                try {

                    if(this.projectViewCollabs == undefined || !this.projectViewCollabs.length || this.projectView == undefined){
                        return;
                    }

                    const res: any = await this.$axios.post('project/remove-collaborator', {userId: this.projectViewCollabs[ind].id, projectId: this.projectView.id});

                    if(res.status == 400){
                        this.$flashMessage.show({
                            type: 'error',
                            // image: require("../../assets/flashMessage/fail.svg"),
                            text: res.data.msg,
                        });
                        return;  
                    }

                    this.projectViewCollabs.splice(ind, 1);

                    this.$flashMessage.show({
                        type: 'success',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: res.data.msg,
                    });
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        // image: require("../../assets/flashMessage/fail.svg"),
                        text: `Error with query`,
                    });
                    return;   
                }
            },

        },


        mounted: async function(){
            this.friends        = await this.getFriends(this.friendsRange, this.friendsCount);
            this.projects       = await this.getProjects(this.projectsRange, this.projectsCount, this.projectsFilter)
            this.amountProjects = await this.getAmountProjects(this.projectsRange, this.projectsCount, this.projectsFilter);
        },


        created: async function(){
            
            const viewStatusElements: Array<Option> = [];

            try {
                const res = await this.$axios.post('project/get-view-status');
                
                if(res.status == 200){
                    res.data.viewStatusElements.forEach((elem: any) => {
                        console.log(elem);
                        viewStatusElements.push({text: elem.name, id: elem.id});
                    });
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
            
            this.rowsEditProjectForm[1][0].options  = viewStatusElements;
            this.rowsEditProjectForm[1][0].selected = viewStatusElements[0].id
        },

        components: {
            Menu,
            Pagination,
            ActionBack,
            Form,
            draggable: VueDraggableNext,
        },
    });
</script>

<style lang="scss">
    @import '../assets/scss/pages/home.scss';
</style>

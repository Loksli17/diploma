<template>
    <div class="page-user-edit">
        <Menu ref="globalMenu"></Menu>

        <ActionBack ref="actionBackData" v-bind:headerMainText="`User with id: ${this.user.id}`" v-bind:headerAddText="`Edit`">
            <Form
                ref="dataForm"
                v-bind:rows="rowsEditForm"
                v-bind:action="'/user/edit'"
                v-bind:tableName="'user'"
                v-bind:className="'change-user-form form'"
                v-bind:successCode="201"
                v-bind:overloadParseResult="true"
                v-on:result-parser="editFormResultParser"
            />
        </ActionBack>

        <ActionBack ref="actionBackPassword" v-bind:headerMainText="`User with id: ${this.user.id}`" v-bind:headerAddText="`Edit password`">
            <Form
                v-bind:rows="rowsPasswordForm"
                v-bind:action="'/user/edit-password'"
                v-bind:className="'change-password-form form'"
                v-bind:successCode="201"
                v-bind:overloadParseResult="true"
                v-on:result-parser="passwordFormResultParser"
            />
        </ActionBack>

        <ActionBack ref="actionBackAvatar" v-bind:headerMainText="`User with id: ${this.user.id}`" v-bind:headerAddText="`Add avatar`">
            <div class="upload-avatar-field" :class="{'active-field': fileDropStatus}">
                <form class="fileForm" :class="{'form-active': fileOverStatus}" ref="fileForm" @drop.prevent="fileDrop" @dragenter.prevent @dragover.prevent="fileOver" @dragleave="fileLeave">
                    <span>Drop new image here</span>
                </form>
                <div v-if="fileDropStatus">
                    <img  :src="fileSrc" alt="">
                </div>
                <div class="info" v-if="fileDropStatus">
                    <span>Size: {{file.size}}</span>
                    <span>Name: {{file.name}}</span>
                    <div>
                        <progress v-if="fileUploading" :value="progressValue" max="100"></progress>
                        <button @click="sendFile" class="btn">Load image</button>
                    </div> 
                </div> 
            </div>
        </ActionBack>


        <div class="page-wrap">

            <div class="avatar-wrap">
                <h2>Avatar</h2>
                <div class="avatar" :style="{backgroundImage: `url(http://localhost:3000/img/avatars/${this.user.avatar})`}"></div>
                <button @click="editAvatarEvt" class="btn bth-avatar">Edit Avatar</button>
            </div>

            <div class="data-wrap">
                <h2>Data of user</h2>

                <table class="user-view">
                    <tr>
                        <td>Login</td>
                        <td>{{this.user.login}}</td>
                    </tr>
                    <tr>
                        <td>Surname</td>
                        <td>{{this.user.lastName}}</td>
                    </tr>
                    <tr>
                        <td>Name</td>
                        <td>{{this.user.firstName}}</td>
                    </tr>
                    <tr>
                        <td>E-mail</td>
                        <td>{{this.user.email}}</td>
                    </tr>
                </table>

                <button @click="editDataEvt" class="btn">Edit data</button>
            </div>

            <div class="notific-wrap">

                <div class="header">
                    <h2>Notifications</h2>
                    <button class="btn" @click="removeNotifications">Clear all</button>
                </div>

                <div class="notifications-wrap">
                    <NotificationComp 
                        v-on:remove-notification="removeNotification"
                        v-on:open-action-back="answerFriendship" 
                        v-for="notific in notifications" 
                        :key="notific.id" 
                        v-bind:notification="notific"
                    >
                    </NotificationComp>
                </div>
            </div>

            <div class="add-btn-wrap">
                <button class="btn" @click="editPasswordEvt">Edit password</button>
                <button class="btn btn-error" @click="deleteUserEvt">Delete</button>
            </div>
        </div>

        <AnswerFriendNotification ref="answerFriendship"
            v-on:not-accept="removeFriendshipNotification"
            v-on:accept="goodAnswer"
        ></AnswerFriendNotification>
    </div>
</template>


<script lang="ts">
    declare const require: any;
    import {defineComponent} from 'vue';
    import Form, {FormItem}  from '../../components/Form.vue';
    import User              from "../../types/User";
    import Notification      from "../../types/Notification";
    import ActionBack        from '../../components/ActionBack.vue';
    import NotificationComp  from '../../components/Notification.vue';

    import AnswerFriendNotification from '../../components/AnswerFriendNotification.vue';
    
    export default defineComponent({

        data: function(){
            return {
                user              : {} as User,
                capableDragAndDrop: false as boolean,
                fileSrc           : '',
                progressValue     : 0,
                fileOverStatus    : false as boolean,
                fileDropStatus    : false as boolean,
                file              : {} as File,
                fileUploading     : false as boolean,

                rowsEditForm: [
                    [{type: 'text', name: 'login', label: 'Login'}, {type: 'hidden', name: 'id'}],
                    [{type: 'text', name: 'lastName', label: 'Surname', value: ''}],
                    [{type: 'text', name: 'firstName', label: 'Name'}],
                    [{type: 'submit', name: 'submit', value: 'Edit user'}],
                ] as Array<Array<FormItem>>,
                
                rowsPasswordForm: [
                    [{type: 'password', name: 'old'}, {type: 'password', name: 'new'}, {type: 'hidden', name: 'id'}],
                    [{type: 'submit', name: 'submit', value: 'Edit password'}],
                ] as Array<Array<FormItem>>,

                notifications: [] as Array<Notification> | null, 
            }
        },

        created: function(){
            this.user = this.$store.state.userIdentity!;

            this.rowsEditForm[0][1].value = this.user.id;
            this.rowsEditForm[0][0].value = this.user.login;
            this.rowsEditForm[1][0].value = this.user.lastName;
            this.rowsEditForm[2][0].value = this.user.firstName;

            this.rowsPasswordForm[0][2].value = this.user.id;

            this.notifications = this.$store.state.notifications!;

        },

        updated: function(){
            this.user = this.$store.state.userIdentity!;

            this.rowsEditForm[0][1].value = this.user.id;
            this.rowsEditForm[0][0].value = this.user.login;
            this.rowsEditForm[1][0].value = this.user.lastName;
            this.rowsEditForm[2][0].value = this.user.firstName;

            this.rowsPasswordForm[0][2].value = this.user.id;
        },

        methods: {

            answerFriendship: function(data: Notification){
                const answerFriendNotification = this.$refs.answerFriendship as any;
                answerFriendNotification.setNotification(data);
                answerFriendNotification.setViewStatus(true);
            },

            removeFriendshipNotification: function(notification: Notification){
                const index = this.notifications!.findIndex(item => item.id == notification.id);

                this.notifications!.splice(index, 1);
                this.$store.commit('removeNotification', index);

                const menu = this.$refs.globalMenu as any;
                menu.setNotificationAmount(this.$store.state.notifications == null ? 0 : this.$store.state.notifications.length);

                const answerFriendNotification = this.$refs.answerFriendship as any;
                answerFriendNotification.setViewStatus(false);
            },

            goodAnswer: function(notification: Notification){
                const index = this.notifications!.findIndex(item => item.id == notification.id);

                this.notifications!.splice(index, 1);
                this.$store.commit('removeNotification', index);

                const answerFriendNotification = this.$refs.answerFriendship as any;
                answerFriendNotification.setViewStatus(false);

                const menu = this.$refs.globalMenu as any;
                menu.setNotificationAmount(this.$store.state.notifications == null ? 0 : this.$store.state.notifications.length);

                this.addFriendInList(notification);
            },

            addFriendInList: async function(notification: Notification){

                try {
                    const res = await this.$axios.post('/user/add-friends', {
                        userHasUser: {
                            userId1: notification.userReceiveId,
                            userId2: notification.userSendId,
                        },
                        userSend: notification.userSend,
                    });

                    if(res.status == 201){
                        this.$flashMessage.show({
                            type: 'success',
                            text: res.data.msg,
                            image: require("../../assets/flash/success.svg"),
                        });
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            text: 'Error with query',
                            image: require("../../assets/flash/fail.svg"),
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                        image: require("../../assets/flash/fail.svg"),
                    });
                    console.error(err);
                }
            },
            


            editDataEvt: function(){
                const backComp = this.$refs.actionBackData! as any;
                backComp.show();
            },

            editPasswordEvt: function(){
                const background = this.$refs.actionBackPassword! as any;
                background.show();
            },

            editAvatarEvt: function(){
                const background = this.$refs.actionBackAvatar! as any;
                background.show();
            },



            fileOver: function(){
                this.fileOverStatus = true;
            },

            fileLeave: function(){
                this.fileOverStatus = false;
            },

            fileDrop: function(e: any){
                
                const
                    reader: FileReader = new FileReader(), 
                    file: File         = e.dataTransfer.files[0];

                let checkFileResult: {msg: string; success: boolean} = {msg: '', success: false};

                checkFileResult = this.checkFile(file);

                if(!checkFileResult.success){
                    this.$flashMessage.show({
                        blockClass: 'warning',
                        image: require("../../assets/flash/warning.svg"),
                        text: 'Format of file must be PNG or JPEG',
                        title: "File",
                    });
                    throw Error('Bad format of file')
                }

                reader.addEventListener('load', (e: any) => {
                    const data = e.target.result;
                    this.fileSrc = data;
                    this.fileOverStatus = false;
                    this.fileDropStatus = true;
                    this.file           = file;
                })

                reader.readAsDataURL(file);
            },

            //* for file Upload
            checkFile: function(file: any): {msg: string; success: boolean}{

                if(file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/jpg'){
                    return {msg: 'File is not a image!', success: false};
                }

                if(file.size > 8 * 1014 * 1024 * 8){
                    return {msg: 'Size of file more then 8mb', success: false};
                }

                return {msg: 'Good file', success: true};
            },

            //* for file Upload
            sendFile: async function(){
                const data: FormData = new FormData();
                data.append('file', this.file);
                data.append('userId', String(this.$store.state.userIdentity!.id));

                console.log(this.file);

                const res = await this.$axios.post('user/edit-avatar', data, {
                    onUploadProgress: (e) => {
                        this.progressValue = Math.floor(e.loaded * 100 / e.total);
                    }
                });
                
                if(res.status == 400){
                    this.$flashMessage.show({
                        type: 'error',
                        text: res.data.error,
                    });
                    return;
                }

                //*change data about path of avatar
                if(res.status == 200){
                    this.$store.commit('setUserIdentity', res.data.user);

                    this.$flashMessage.show({
                        type: 'success',
                        text: res.data.msg,
                    });

                    console.log(this.$store.state.userIdentity);
                }
            },


            //* for edit User
            editFormResultParser: function(res: any){

                if(res.status == 400){
                    return;
                }
                
                this.$store.commit('setUserIdentity', res.data.user);
                this.user = res.data.user;
                
                this.$flashMessage.show({
                    type: 'success',
                    image: require("@/assets/flash/success.svg"),
                    text: res.data.msg,
                });
            },


            passwordFormResultParser: function(res: any){

                if(res.status == 400){
                    return;
                }
                
                this.$store.commit('setUserIdentity', res.data.user);
                
                this.$flashMessage.show({
                    type: 'success',
                    image: require("@/assets/flash/success.svg"),
                    text: res.data.msg,
                });

                console.log(res.data.user.password);
            },


            removeNotification: function(id: number){
                this.notifications = this.$store.state.notifications!;

                const menu = this.$refs.globalMenu as any;
                menu.setNotificationAmount(this.notifications.length);
            },


            removeNotifications: async function(){

                if(this.notifications == undefined || this.notifications.length == 0){
                    return;
                }

                try {
                    const res = await this.$axios.post('/notification/delete-many', {
                        ids: this.notifications.map((item) => {
                            return item.id;
                        }),
                    });

                    if(res.status == 200){
                        
                        this.notifications = []; 
                        this.$store.commit('setNotifications', []);
                        
                        const menu = this.$refs.globalMenu as any;
                        menu.setNotificationAmount(0);

                        this.$flashMessage.show({
                            type: 'success',
                            text: res.data.msg,
                            image: require("@/assets/flash/success.svg"),
                        });
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

        components: {
            Form,
            ActionBack,
            NotificationComp,
            AnswerFriendNotification,
        }
    })
</script>


<style lang="scss">
    @import '../../assets/scss/pages/user/edit.scss';
</style>
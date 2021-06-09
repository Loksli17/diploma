<template>
    <div class="page-add-friends">
        <Menu ref="globalMenu"></Menu>

        <div class="page-header">
            <h1>Search new friends</h1>
        </div>

        <div class="page-wrap">
            <div class="section">

                <div class="user-wrap">
                    <UserItem v-for="user in users" :key="user.id" 
                        v-bind:user="user"
                        v-bind:className="'user'"
                        v-bind:onlineStatus="false"
                        v-bind:items="userContexMenuItems"
                        v-bind:addButtonStatus="!user.potentialFriendStatus"
                        v-bind:fullNameStatus="true"
                        v-on:add-to-friendlist="addToFriendlist"
                        >
                    </UserItem>
                </div>

                <div class="pagenation-wrap">
                    <Pagination
                        ref="pagination"
                        :take=usersRange
                        :currentPage=currentPage
                        :pageSize="6"
                        :endButton="true"
                        :startButton="true"
                        :amountElements=amountUsers
                        v-on:page-change="pageChangeEvt"
                    />
                </div>
            </div>

            <div class="aside">
                <form action="/user/search-user" class="form" @submit.prevent="sendSearchData">
                    <div class="form-row">
                        <label class="form-col">
                            <span>Login</span>
                            <input type="text" v-model="user.login">
                        </label>
                        <label class="form-col">
                            <span>E-mail</span>
                            <input type="email" v-model="user.email">
                        </label>
                    </div>
                    <div class="form-row">
                        <label class="form-col">
                            <span>Name</span>
                            <input type="text" v-model="user.firstName">
                        </label>
                        <label class="form-col">
                            <span>Surname</span>
                            <input type="text" v-model="user.lastName">
                        </label>
                    </div>
                    <div class="form-row">
                        <label class="form-col">
                            <input type="submit" value="Search">
                         </label>
                    </div>
                </form>

                <div class="notifications-wrap">
                    <div class="notifications-send">
                        <h2>My queries to friendlist</h2>

                        <div>
                            <div class="notification" v-for="(notific, index) in sendNotifications" :key="notific.id">
                                <span>TO: </span>
                                <span>{{notific.userReceive.lastName}} {{notific.userReceive.firstName}}</span>
                                <div class="close" @click="removeNotification(notific, index)">&#10006;</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="notifications-receive">
                        <h2>Queries to friendlist to me</h2>

                        <div>
                            <div class="notification" v-for="notific in receiveNotifications" @click="showAnswerFriendship(notific)" :key="notific.id">
                                <span>FROM: </span>
                                <span>{{notific.userSend.lastName}} {{notific.userSend.firstName}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <AnswerFriendNotification ref="answerFriendship"
            v-on:not-accept="removeSendNotification"
            v-on:accept="goodAnswer"
        ></AnswerFriendNotification>
    </div>
</template>


<script lang="ts">
    declare const require: any;

    import {defineComponent}        from 'vue';
    import User                     from '../../types/User';
    import UserItem, {MenuUserItem} from '../../components/UserItem.vue';
    import Pagination               from '../../components/Pagination.vue';
    import Notification             from '../../types/Notification';
    import AnswerFriendNotification from '../../components/AnswerFriendNotification.vue';


    export default defineComponent({

        components: {
            UserItem, 
            Pagination,
            AnswerFriendNotification,
        },

        data: function(){
            return {

                usersRange : 7 as number,
                usersCount : 0 as number,
                amountUsers: 0 as number,
                currentPage: 1 as number,
                users      : [] as Array<User> | undefined,

                user : {email: '', login: '', firstName: '', lastName: ''} as object,

                userContexMenuItems: [
                    {value: "View profile", link: "/user/view?id=", img: "view-icon.svg"},
                    {value: "Go to chat", link: "/chat?idUserReceive=", img: "chat-icon.svg"}, 
                ] as Array<MenuUserItem>,

                formData       : {take: 0} as object,
                sendFormCounter: 0 as number,

                receiveNotifications: [] as Array<Notification> | undefined,
                sendNotifications   : [] as Array<Notification> | undefined,
            }
        },

        mounted: async function(){
            const res = await this.getUsersAmount({userId: this.$store.state.userIdentity!.id, take: this.usersRange, skip: 0, user: {login: '', email: '', firstName: '', lastName: ''}});

            this.users       = res.users;
            this.amountUsers = res.amount;
            
            this.receiveNotifications = this.getRecieveNotifications();
            this.sendNotifications    = await this.getSendNotifications();

            //! create status for active or non-active "plus-button"
            if(this.users == undefined || this.sendNotifications == undefined) return;

            this.users = this.users.map((user: User) => {
                user.potentialFriendStatus = this.sendNotifications!.findIndex(
                    (notific: Notification) => notific.typeNotificationId == 1 && notific.userReceiveId == user.id
                ) == -1 ? false : true;
                return user;
            });

            console.log(this.users);
        },

        created: function(){

            this.$socket.on('notification', (data: any) => {
                if(this.receiveNotifications == undefined) return;
                if(data.notification.typeNotificationId == 1) this.receiveNotifications.push(data.notification);
            });

            this.$socket.on('removeNotification', (data: any) => {
                if(this.receiveNotifications == undefined) return;
                const index: number = this.receiveNotifications.findIndex(item => item.id == data.notification.id);
                if(data.notification.typeNotificationId == 1) this.receiveNotifications.splice(index, 1);
            });

            this.$socket.on('answerFriendship', (data: any) => {
                if(this.sendNotifications == undefined) return;
                const index: number = this.sendNotifications.findIndex(item => item.id == data.notification.id);
                if(data.notification.typeNotificationId == 1) this.sendNotifications.splice(index, 1);
            });
        },

        methods: {

            addToFriendlist: function(notification: Notification){
                if(this.sendNotifications == undefined) this.sendNotifications = [];
                this.sendNotifications.push(notification);

                if(this.users != undefined) this.users[this.users.findIndex(user => user.id == notification.userReceiveId)].potentialFriendStatus = true;
            },

            getUsersAmount: async function(body: object){
                try {
                    const res = await this.$axios.post('/user/search-user', body);

                    if(res.status == 200){
                        return res.data;
                    }else{

                        this.$flashMessage.show({
                            blockClass: 'error',
                            image: require("../../assets/flash/fail.svg"),
                            text: 'Error with query',
                            title: "Server",
                        });
                        console.error(res.data.error);
                    }
                }catch(err){
                    this.$flashMessage.show({
                        blockClass: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: 'Error with query',
                        title: "Server",
                    });
                    console.error(err);  
                }
            },


            getSendNotifications: async function(): Promise<Array<Notification> | undefined>{

                try {
                    const res = await this.$axios.post('/notification/get-friends-notifications', {userId: this.$store.state.userIdentity!.id, type:"send"});

                    if(res.status == 200){
                        return res.data.notifications;
                    }else{
                       this.$flashMessage.show({
                            blockClass: 'error',
                            image: require("../../assets/flash/fail.svg"),
                            text: 'Error with query',
                            title: "Server",
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        blockClass: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: 'Error with query',
                        title: "Server",
                    });
                    console.error(err);
                }
            },


            getRecieveNotifications: function(): Array<Notification>{

                if(this.$store.state.notifications == undefined) return [];

                return this.$store.state.notifications.filter((item) => {
                    if(item.typeNotificationId == 1) return item;
                });
            },


            formResultParser: async function(res: any): Promise<void>{

                if(res.status == 400){
                   this.$flashMessage.show({
                        blockClass: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: 'Error with query',
                        title: "Server",
                    });
                    return;
                }

                this.amountUsers = res.data.amount;
                this.users = res.data.users;

                this.$flashMessage.show({
                    blockClass: 'success',
                    image: require("../../assets/flash/fail.svg"),
                    text: 'Error with query',
                    title: "Users were founded",
                });
                return;
            },


            sendSearchData: async function(){
                const res = await this.getUsersAmount({userId: this.$store.state.userIdentity!.id, take: this.usersRange, skip: 0, user: this.user});

                this.users       = res.users;
                this.amountUsers = res.amount;
            },

            
            removeNotification: async function(notific: Notification, index: number){

                try {
                    const res = await this.$axios.post('/notification/delete', {id: notific.id});

                    if(res.status == 200){
            
                        this.sendNotifications!.splice(index, 1);

                        if(this.users != undefined) this.users[this.users.findIndex(user => user.id == notific.userReceiveId)].potentialFriendStatus = false;

                        this.$socket.emit('removeNotification', {notification: notific, msg: `User ${notific.userSend!.firstName} ${notific.userSend!.lastName} removed request for friendlist.`});

                        this.$flashMessage.show({
                            blockClass: 'success',
                            image: require("../../assets/flash/fail.svg"),
                            text: res.data.msg,
                            title: "Notification",
                        });

                    }else{

                        this.$flashMessage.show({
                            blockClass: 'error',
                            image: require("../../assets/flash/fail.svg"),
                            text: "Error with query",
                            title: "Server",
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        blockClass: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: "Error with query",
                        title: "Server",
                    });
                    console.error(err);
                }
            },

            
            showAnswerFriendship: function(notific: Notification){
                const answerFriendNotification = this.$refs.answerFriendship as any;
                answerFriendNotification.setNotification(notific);
                answerFriendNotification.setViewStatus(true);
            },


            //negative answer to friendship
            removeSendNotification: async function(notification: Notification){
                const index = this.receiveNotifications!.findIndex(item => item.id == notification.id);

                this.receiveNotifications!.splice(index, 1);
                this.$store.commit('removeNotification', index);

                const menu = this.$refs.globalMenu as any;
                menu.setNotificationAmount(this.$store.state.notifications == null ? 0 : this.$store.state.notifications.length);

                const answerFriendNotification = this.$refs.answerFriendship as any;
                answerFriendNotification.setViewStatus(false);
            },


            goodAnswer: async function(notification: Notification){
                const index = this.receiveNotifications!.findIndex(item => item.id == notification.id);

                this.receiveNotifications!.splice(index, 1);
                this.$store.commit('removeNotification', index);

                const answerFriendNotification = this.$refs.answerFriendship as any;
                answerFriendNotification.setViewStatus(false);

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
                            blockClass: 'success',
                            image: require("../../assets/flash/success.svg"),
                            text: res.data.msg,
                            title: "Frienship",
                        });

                    }else{
                        this.$flashMessage.show({
                            blockClass: 'error',
                            image: require("../../assets/flash/fail.svg"),
                            text: "Error with query",
                            title: "Server",
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        blockClass: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: "Error with query",
                        title: "Server",
                    });
                    console.error(err);
                }
            },

            pageChangeEvt: async function(data: {take: number; skip: number}){

                const responseData: {users: Array<User>; amount: number} | undefined = await this.getUsersAmount({userId: this.$store.state.userIdentity!.id, take: data.take, skip: data.skip, user: this.user});

                if(!responseData!.users.length){

                    this.$flashMessage.show({
                        blockClass: 'warning',
                        image: require("../../assets/flash/warning.svg"),
                        text: `No more users`,
                        title: "Pagination",
                    });
                    return;
                }

                this.users = responseData!.users;
                
                this.users = this.users.map((user: User) => {
                    user.potentialFriendStatus = this.sendNotifications!.findIndex(
                        (notific: Notification) => notific.typeNotificationId == 1 && notific.userReceiveId == user.id
                    ) == -1 ? false : true;
                    return user;
                });
            }
        },
        
        
    })
</script>

<style lang="scss">
    @import '../../assets/scss/pages/user/addFriends.scss';
</style>
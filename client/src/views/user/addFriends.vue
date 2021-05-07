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
                        v-bind:addButtonStatus="true"
                        v-bind:fullNameStatus="true"
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
                            <div class="notification" v-for="notific in sendNotifications" :key="notific.id">
                                <span>{{notific.text}}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="notification-receive">
                        <h2>Queries to friendlist to me</h2>

                        <div>
                            <div class="notification" v-for="notific in receiveNotifications" :key="notific.id">
                                <span>{{notific.text}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
    declare const require: any;

    import {defineComponent}        from 'vue';
    import User                     from '../../types/User';
    import UserItem, {MenuUserItem} from '../../components/UserItem.vue';
    import Pagination               from '../../components/Pagination.vue';
    import Notification             from '../../types/Notification';


    export default defineComponent({

        components: {
            UserItem, 
            Pagination
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
                    {value: "Go to chat", link: "/chat?roomId=", img: "chat-icon.svg"}, 
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
            
            this.receiveNotifications = this.$store.state.notifications!;
            this.sendNotifications    = await this.getSendNotifications();
        },

        methods: {

            getUsersAmount: async function(body: object){
                try {
                    const res = await this.$axios.post('/user/search-user', body);

                    if(res.status == 200){
                        return res.data;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            text: 'Error with query',
                            image: require("../../assets/flash/fail.svg"),
                        });
                        console.error(res.data.error);
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

            getSendNotifications: async function(): Promise<Array<Notification> | undefined>{

                try {
                    const res = await this.$axios.post('/notification/get-notifications', {userId: this.$store.state.userIdentity!.id, type:"send"});

                    if(res.status == 200){
                        return res.data.notifications;
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

            formResultParser: async function(res: any): Promise<void> {

                if(res.status == 400){
                   this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                        image: require("../../assets/flash/fail.svg"),
                    });
                    return;
                }

                this.amountUsers = res.data.amount;
                this.users = res.data.users;

                this.$flashMessage.show({
                    type: 'success',
                    image: require("../../assets/flash/success.svg"),
                    text: `Users were founded`,
                });
                return;
            },

            sendSearchData: async function(){
                const res = await this.getUsersAmount({userId: this.$store.state.userIdentity!.id, take: this.usersRange, skip: 0, user: this.user});

                this.users       = res.users;
                this.amountUsers = res.amount;
            },

            pageChangeEvt: async function(data: {take: number; skip: number}){

                const responseData: {users: Array<User>; amount: number} | undefined = await this.getUsersAmount({userId: this.$store.state.userIdentity!.id, take: data.take, skip: data.skip, user: this.user});

                if(!responseData!.users.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../../assets/flash/warning.svg"),
                        text: `No more users`,
                    });
                    return;
                }

                this.users = responseData!.users;
            }
        },
        
        
    })
</script>

<style lang="scss">
    @import '../../assets/scss/pages/user/addFriends.scss';
</style>
<template>
    <div class="page-chat">
        <Menu ref="globalMenu"></Menu>

        <div class="page-wrap">
            
            <div class="chat-list">
                <div class="header">
                    <form class="" @submit.prevent="searchProjectsEvt" action="">
                        <div><img :src=" require(`../assets/search-icon.svg`)"></div>
                        <input v-model="searchValueProject" type="search" placeholder="User login or email">
                        <button class="btn clear-btn">Clear</button>
                    </form>
                </div>

                <div class="chats-wrap">
                    <div class="chat-item" v-for="(chat, index) in chats" :key="chat.id" @click="changeChatEvt(index, chat)">
                        <div class="avatar" :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${chat.user2.avatar}`) + ')'}"></div>
                        <div class="section">
                            <div class="login">{{chat.user2.login}}</div>
                            <div class="last-message">
                                <div class="avatar" :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${chat.lastMessage.user.avatar}`) + ')'}">
                                    
                                </div>
                                <span>
                                    {{chat.lastMessage.text}}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="current-chat">
                <div class="header">
                    <div class="avatar" :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${interlocutor.avatar}`) + ')'}"></div>
                    <div class="name">{{interlocutor.firstName}} {{interlocutor.lastName}} ({{interlocutor.login}})</div>
                    <span v-if="interlocutor.status" class="online">online</span>
                    <span v-else class="offline">offline</span>
                </div>

                <div class="messages-wrap">
                    <div class="message" v-for="message in currentChat.messages" :key="message">
                        <div class="identity-message" v-if="$store.state.userIdentity.id == message.userId">
                            <div class="avatar" :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${$store.state.userIdentity.avatar}`) + ')'}"></div>
                            <div class="text">
                                <span>{{message.text}}</span>
                                <span>{{$filters.datetimeToViewMessage(message.date)}}</span>
                            </div>
                        </div>

                        <div v-else class="interlocutor-message">
                            <div></div>
                            <div class="text">
                                <span>{{message.text}}</span>
                                <span>{{$filters.datetimeToViewMessage(message.date)}}</span>
                            </div>
                            <div class="avatar" :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${interlocutor.avatar}`) + ')'}"></div>
                        </div>
                    </div>
                </div>

                <div class="chat-form">
                    <form action="">
                        <input v-model="message" type="text" placeholder="Print text here..">
                        <input type="submit" value="Send">
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
    declare const require: any;
    import {defineComponent} from 'vue';
    import Menu              from '../components/Menu.vue';
    import Chat              from '../types/Chat';
    import User              from '../types/User';


    export default defineComponent({

        data: function(){
            return {
                chats       : [] as Array<Chat>,
                currentChat : {} as Chat,
                interlocutor: {avatar: 'default-user.png'} as User,
                // identityUser: {} as User,
                
                message: "" as string,
            }
        },

        components: {
            Menu,
        },

        methods: {
            getChats: async function(){
                try {
                    const res = await this.$axios.post('/chat/getChats', {
                        userId: this.$store.state.userIdentity!.id,
                    });

                    if(res.status == 200){
                        return res.data.chats;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            text: 'Error with query',
                            image: require("../assets/flash/fail.svg"),
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                        image: require("../assets/flash/fail.svg"),
                    });
                    console.error(err);
                }
            },

            getChat: async function(user1Id: number, user2Id: number){
                
                try {
                    const res = await this.$axios.post('/chat/get', {
                        user1Id: user1Id,
                        user2Id: user2Id,
                    });

                    if(res.status == 200){
                        return res.data.chat;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            text: 'Error with query',
                            image: require("../assets/flash/fail.svg"),
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                        image: require("../assets/flash/fail.svg"),
                    });
                    console.error(err);
                }
            },

            createChat: async function(){

                try {
                    const res = await this.$axios.post('/chat/add', {
                        user1Id: this.$store.state.userIdentity!.id,
                        user2Id: Number(this.$route.query.idUserReceive),
                    });

                    if(res.status == 200){
                        return res.data.chat;
                    }else{
                        this.$flashMessage.show({
                            type: 'error',
                            text: 'Error with query',
                            image: require("../assets/flash/fail.svg"),
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        text: 'Error with query',
                        image: require("../assets/flash/fail.svg"),
                    });
                    console.error(err);
                }
            },

            changeChatEvt: async function(index: number, chat: any){
                
                this.currentChat = await this.getChat(chat.user1Id, chat.user2Id);

                if(this.currentChat.user1!.id == this.$store.state.userIdentity!.id){
                    this.interlocutor = this.currentChat.user2!;
                }else{
                    this.interlocutor = this.currentChat.user1!;
                }

            }
        },

        created: async function(){
            this.currentChat = await this.getChat(this.$store.state.userIdentity!.id, Number(this.$route.query.idUserReceive));

            if(this.currentChat == undefined){
                this.currentChat = await this.createChat();
            }

            if(this.currentChat.user1!.id == this.$store.state.userIdentity!.id){
                this.interlocutor = this.currentChat.user2!;
            }else{
                this.interlocutor = this.currentChat.user1!;
            }

            this.chats = await this.getChats();
            // this.currentChat.messages.forEach((item) => {
            //     item.dateString = this.$filters.datetimeToViewMessage(item.date);
            //     return item;
            // });

            console.log(this.chats, this.currentChat);
        },
    });
</script>


<style lang="scss">
    @import '../assets/scss/pages/chat.scss';
</style>
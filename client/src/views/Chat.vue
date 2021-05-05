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
                    <div v-for="chat in chats" :key="chat.id">
                        <div class="avatar"></div>
                        <div>
                            <div class="login"></div>
                            <div class="last-message">{{chat.id}}</div>
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
                        <div>
                            <div class="avatar"></div>
                            <div class="text">{{message.text}}</div>
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
                
                message: "" as string,
            }
        },

        // watch: {
        //     interlocutor: function(oldVal, newVal){
        //         this.interlocutor = Object.assign({}, newVal);
        //     }
        // },

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

            getChat: async function(){
                
                try {
                    const res = await this.$axios.post('/chat/get', {
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
        },

        created: async function(){
            this.currentChat = await this.getChat();

            if(this.currentChat == undefined){
                this.currentChat = await this.createChat();
            }

            if(this.currentChat.user1!.id == this.$store.state.userIdentity!.id){
                this.interlocutor = this.currentChat.user2!;
            }else{
                this.interlocutor = this.currentChat.user1!;
            }

            this.chats = await this.getChats();

            console.log(this.chats);
        },
    });
</script>


<style lang="scss">
    @import '../assets/scss/pages/chat.scss';
</style>
<template>
    <div class="page-chat">
        <Menu ref="globalMenu"></Menu>

        <div class="page-wrap">
            
            <div class="chat-list">
                <div class="header">
                    <form class="" @submit.prevent="searchProjectsEvt" action="">
                        <div><img :src=" require(`../assets/search-icon.svg`)"></div>
                        <input v-model="searchValueProject" type="search" placeholder="User login or email">
                        <button type="button" class="btn clear-btn" @click="clearSearchForm">Clear</button>
                    </form>
                </div>

                <div class="chats-wrap">
                    <div class="chat-item" v-for="(chat, index) in chats" :class="{active: chat.isActive}" :key="chat.id" @click="changeChatEvt(index, chat)">
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
                    <router-link class="name" :to="`/user/view?id=${interlocutor.id}`">{{interlocutor.firstName}} {{interlocutor.lastName}} ({{interlocutor.login}})</router-link>
                    <span v-if="interlocutor.status" class="online">online</span>
                    <span v-else class="offline">offline</span>
                    <button class="btn delete-chat" @click="removeChat">Delete chat</button>
                </div>

                <div ref="messagesWrap" class="messages-wrap" @scroll="moreMessages">
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

                    <div class="pseudo-block"></div>
                </div>

                <div class="chat-form">
                    <form action="" @submit.prevent="sendMessage">
                        <input v-model="message" type="text" placeholder="Message..">
                        <input type="submit" value="Send">
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
    declare const require: any;
    import {defineComponent, nextTick} from 'vue';
    
    import Chat from '../types/Chat';
    import User from '../types/User';


    export default defineComponent({

        data: function(){
            return {
                chats       : [] as Array<Chat>,
                allChats    : [] as Array<Chat>,
                currentChat : {} as Chat,
                interlocutor: {avatar: 'default-user.png'} as User,
                
                message           : "" as string,
                searchValueProject: "" as string,
            }
        },

        methods: {
            getChats: async function(){
                try {
                    const res = await this.$axios.post('/chat/get-chats', {
                        userId: this.$store.state.userIdentity!.id,
                    });

                    if(res.status == 200){
                        return res.data.chats;
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
                        console.log("sdfsdf");
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
            },

            changeChatEvt: async function(index: number, chat: any){
                
                this.currentChat = await this.getChat(chat.user1Id, chat.user2Id);

                if(this.currentChat.user1!.id == this.$store.state.userIdentity!.id){
                    this.interlocutor = this.currentChat.user2!;
                }else{
                    this.interlocutor = this.currentChat.user1!;
                }

                this.$router.push(`/chat?idUserReceive=${this.interlocutor.id}`);

                this.chats.forEach(elem => {
                    elem.isActive = false;
                });

                this.allChats.forEach(elem => {
                    elem.isActive = false;
                });

                this.chats[index].isActive    = true;
                this.allChats[index].isActive = true;
                
                nextTick(() => {
                    this.messageWrapScrollEnd(true);
                });
            },

            messageWrapScrollEnd: function(scrollFlag: boolean){

                if(!scrollFlag){
                    return;
                }

                const messagesWrap = this.$el.querySelector(".messages-wrap");
                messagesWrap.scrollTop = messagesWrap.scrollHeight;
            },

            sendMessage: async function(){

                try {
                    const res = await this.$axios.post('/chat/save-message', {
                        text  : this.message,
                        userId: this.$store.state.userIdentity!.id,
                        chatId: this.currentChat.id,
                    });

                    if(res.status == 200){

                        const messagesWrap = this.$refs.messagesWrap as any;
                        const scrollFlag   =  (messagesWrap.scrollHeight - messagesWrap.scrollTop) < 700;

                        this.$socket.emit('message', {message: res.data.message, userReceiveId: this.interlocutor.id, userSend: this.$store.state.userIdentity});
                        this.currentChat.messages.push(res.data.message);
                        this.message = "";

                        nextTick(() => {
                            this.messageWrapScrollEnd(scrollFlag);
                        });

                        //if currentChat is new and this doesn't have messages we need in add it to chats
                        if(this.currentChat.messages.length == 1){
                            this.chats    = await this.getChats();
                            this.allChats = JSON.parse(JSON.stringify(this.chats));
                        }

                        const chat: Chat | undefined = this.chats.find((item) => item.isActive == true);

                        if(chat == undefined){
                            return;
                        }

                        chat.lastMessage = res.data.message;
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
            },

            searchProjectsEvt: function(){

                if(this.searchValueProject == ""){
                    this.chats = this.allChats;
                    return;
                }

                this.chats = this.chats.filter((item: Chat) => {

                    const
                        login: string = item.user2!.login.toLowerCase(),
                        email: string = item.user2!.login.toLowerCase();

                    if(login.includes(this.searchValueProject.toLowerCase()) || email.includes(this.searchValueProject.toLowerCase())){
                        return item;
                    }
                });
            },

            clearSearchForm: function(){
                this.searchValueProject = "";
                this.chats = JSON.parse(JSON.stringify(this.allChats));
            },

            moreMessages: async function(){

                const messagesWrap: any = this.$refs.messagesWrap as any;

                if(messagesWrap.scrollTop > 150){
                    return;
                }

                try {
                    const res = await this.$axios.post('/chat/get-messages', {
                        chatId: this.currentChat.id,
                        take  : 50,
                        skip  : this.currentChat.messages.length,
                    });

                    if(res.status == 200){
                        this.currentChat.messages = res.data.messages.concat(this.currentChat.messages);
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
            },

            removeChat: async function(){

                try {
                    const res = await this.$axios.post('/chat/delete', {
                        id: this.currentChat.id
                    });

                    if(res.status == 200){

                        if(this.chats.length){
                            
                            this.allChats.splice(this.allChats.findIndex((item) => item.id == this.currentChat.id), 1);
                            this.chats.splice(this.chats.findIndex((item) => item.id == this.currentChat.id), 1);

                            this.currentChat = await this.getChat(this.chats[0].user1Id, this.chats[0].user2Id);
                            this.chats[0].isActive    = true;
                            this.allChats[0].isActive = true;

                            if(this.currentChat.user1!.id == this.$store.state.userIdentity!.id){
                                this.interlocutor = this.currentChat.user2!;
                            }else{
                                this.interlocutor = this.currentChat.user1!;
                            }

                            console.log(this.currentChat);
                        }

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


        created: async function(){
            this.currentChat = await this.getChat(this.$store.state.userIdentity!.id, Number(this.$route.query.idUserReceive));

            if(this.currentChat == undefined){
                this.currentChat          = await this.createChat();
                this.currentChat.messages = [];
            }

            if(this.currentChat.user1!.id == this.$store.state.userIdentity!.id){
                this.interlocutor = this.currentChat.user2!;
            }else{
                this.interlocutor = this.currentChat.user1!;
            }

            this.chats = await this.getChats();
            this.chats = this.chats.map((item) => {
                if(item.lastMessage.chatId == this.currentChat.id) item.isActive = true;
                return item;
            });


            this.allChats = JSON.parse(JSON.stringify(this.chats));

            this.messageWrapScrollEnd(true);

            this.$socket.on('message', (data: any) => {

                const messagesWrap = this.$el.querySelector(".messages-wrap");
                const scrollFlag   = (messagesWrap.scrollHeight - messagesWrap.scrollTop) < 700;

                if(this.currentChat == undefined){
                    this.getChat(this.$store.state.userIdentity!.id, Number(this.$route.query.idUserReceive)).then((val) => {
                        this.currentChat = val;
                        this.currentChat.messages.push(data.message);
                        nextTick(() => {
                            this.messageWrapScrollEnd(scrollFlag);
                        });
                    }); 
                }

                this.currentChat.messages.push(data.message);
                
                nextTick(() => {
                    this.messageWrapScrollEnd(scrollFlag);
                });

                //change message in chat
                const chat: Chat | undefined = this.chats.find((item) => item.lastMessage.chatId == data.message.chatId);

                if(chat == undefined){
                    return;
                }

                chat.lastMessage = data.message;
            });

        },
    });
</script>


<style lang="scss">
    @import '../assets/scss/pages/chat.scss';
</style>
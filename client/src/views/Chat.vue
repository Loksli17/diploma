<template>
    <div class="page-chat">
        <Menu ref="globalMenu">

        </Menu>
    </div>
</template>


<script lang="ts">
    declare const require: any;
    import {defineComponent} from 'vue';
    import Menu              from '../components/Menu.vue';
    import Chat              from '../types/Chat';


    export default defineComponent({

        data: function(){
            return {
                chats      : [] as Array<Chat>,
                currentChat: {} as Chat,
            }
        },

        components: {
            Menu,
        },

        methods: {

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
                
                console.log("kek");
                
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
            }
        },

        created: async function(){

            this.currentChat = await this.getChat();

            if(this.currentChat == undefined){
                this.currentChat = await this.createChat();
            }
            
        }
    });
</script>


<style lang="scss">

</style>
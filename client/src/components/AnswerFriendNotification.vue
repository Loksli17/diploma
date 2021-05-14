
<template>
    <ActionBack ref="actionBackView" v-bind:headerMainText="`${this.notification.userSend.firstName} ${this.notification.userSend.lastName} (${this.notification.userSend.login})`" v-bind:headerAddText="`Invintation to friend list`">
        <div class="answer-wrap">
            <button class="btn" @click="removeNotification(true)">Accept</button>
            <button class="btn" @click="removeNotification(false)">Not accept</button>
        </div>
    </ActionBack>
</template>


<script lang="ts">
    declare const require: any;

    import {defineComponent} from 'vue';
    import ActionBack        from '../components/ActionBack.vue';
    import Notification      from '../types/Notification';

    export default defineComponent({
        
        components: {
            ActionBack,
        },

        data: function(){
            return{ 
                notification: {userSend: {firstName: "", lastName: "", login: ""}} as Notification,
                viewStatus  : false as boolean
            }
        },

        // created: function(){

        // },

        methods: {
            
            setNotification: function(notific: Notification){
                this.notification = notific;
            },

            setViewStatus: function(data: boolean){
                const actionBack = this.$refs.actionBackView! as any;
                if(data) actionBack.show(); else actionBack.hide();
            },


            removeNotification: async function(status: boolean){

                try {
                    const res = await this.$axios.post('/notification/delete', {id: this.notification.id});

                    if(res.status == 200){

                        let msg: string = "";
                        
                        if(status){
                            msg = `User ${this.notification.userSend!.firstName} ${this.notification.userSend!.firstName} accepted your request for friendship.`;
                            this.$emit('accept', this.notification);
                        }else{
                            msg = `User ${this.notification.userSend!.firstName} ${this.notification.userSend!.firstName} NOT accepted your request for friendship.`;
                            this.$emit('not-accept', this.notification);
                        }

                        console.log("asdasdasd", msg);
                        this.$socket.emit('removeNotification', {notification: this.notification, msg: msg});
                        
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
            
        },
    
    });
</script>


<style lang="scss">
    @import '../assets/scss/components/answerFriendNotification.scss';
</style>
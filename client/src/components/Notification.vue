
<template>
    <div @click="clickNotification" class="notification" :class="initClass">
        <div>
            <img :src="require(`../assets/notification/${data.typeNotification.img}`)" alt="">
        </div>
        <div>
            <span>{{data.text}}</span>
        </div>

        <div class="close" @click="removeNotification(tab)">&#10006;</div>
    </div>
</template>

<script lang="ts">
    declare const require: any
    import {defineComponent} from 'vue';
    import Notification      from '../types/Notification';


    export default defineComponent({
        
        props: {
            notification: {
                type    : Object as () => Notification,
                required: true,
            }
        },

        created: function(){
            this.data = this.notification;
        },

        data: function(){
            return {
                data: {} as Notification,
            }
        },

        methods: {

            initClass: function(): string{
                return "add-to-friendlist";
            },

            answer: function(){
                this.$flashMessage.show({
                    type: 'info',
                    text: 'Yout request was sended',
                    image: require("@/assets/flash/fail.svg"),
                });
            },

            clickNotification: function(){
                switch(this.data.typeNotificationId){
                    case 1:
                        this.$emit('open-action-back', this.data);
                        break;
                }
            },

            removeNotification: async function(): Promise<void>{

                try {
                    const res = await this.$axios.post('/notification/delete', {id: this.data.id});

                    if(res.status == 200){

                        this.$store.state.notifications = this.$store.state.notifications!.filter((notific) => {
                            if(notific.id != this.data.id) return notific;
                        });

                        this.$store.commit('setNotifications', this.$store.state.notifications);
                        this.$emit('remove-notification', this.data.id);

                        this.$flashMessage.show({
                            blockClass: 'success',
                            image     : require("@/assets/flash/success.svg"),
                            text      : res.data.msg,
                            title     : "Remove notification",
                        });

                    }else{

                        this.$flashMessage.show({
                            blockClass: 'error',
                            image     : require("@/assets/flash/fail.svg"),
                            text      : 'Error with query',
                            title     : "Remove notification",
                        });
                    }
                }catch(err){
                    this.$flashMessage.show({
                        blockClass: 'error',
                        image     : require("@/assets/flash/fail.svg"),
                        text      : 'Error with query',
                        title     : "Remove notification",
                    });
                    console.error(err);
                }
            }
        },
    })
</script>

<style lang="scss">

</style>
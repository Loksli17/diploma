<template>
    <div class="notification" :class="initClass">
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
                            type: 'success',
                            text: res.data.msg,
                            image: require("../assets/flash/success.svg"),
                        });
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
    })
</script>
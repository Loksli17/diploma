
<template>
    <ActionBack v-if="viewStatus" ref="actionBack" v-bind:headerMainText="`${this.notification.userSend.firstName} ${this.notification.userSend.lastName} (${this.notification.userSend.login})`" v-bind:headerAddText="`Edit password`">
        <div class="answer-wrap">
            <button class="btn">Accept</button>
            <button class="btn">Not accept</button>
        </div>
    </ActionBack>
</template>


<script lang="ts">

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
                this.viewStatus = data;
            }
        },
    
    });
</script>


<style lang="scss">

</style>
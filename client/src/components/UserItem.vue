<template>
    
    <div :class="itemClassName">
        <div>
            <div class="avatar" :style="{backgroundImage: 'url(' + require(`@/assets/user-avatar/${userData.avatar}`) + ')'}"></div>
        </div>

        <div class="">
            <div class="login">
                <span>{{userData.login}}</span>
            </div>
            <div v-if="onlineStatus">
                <span v-if="userData.status" class="online">online</span>
                <span v-else class="offline">offline</span>
            </div>

            <div v-if="addButtonStatus" class="btn-wrap">
                <button class="btn"></button>
            </div>
        </div>
    </div>

</template>


<script lang="ts">
    import {defineComponent} from 'vue'
    import User              from '../types/User';

    export default defineComponent({
        
        props: {
            user: {
                type    : Object as () => User,
                required: true,
            },
            onlineStatus: {
                type    : Boolean,
                required: true,
            },
            addButtonStatus: {
                type: Boolean,
            },
            className: {
                type: String,
            },
            avatarPath: {
                type    : String,
                required: true,
            },
        },

        data: function(){
            return{
                userData: {} as User,
                itemClassName: "user-item" as string,
            }
        },

        created: function(){
            if(this.className != undefined){this.itemClassName = this.className}
            this.userData = this.user;
            console.log("this", this.userData);
        }
    });
</script>
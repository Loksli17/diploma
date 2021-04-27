<template>
    <div class="page-user-view">
        <Menu></Menu>

        <div class="page-wrap">

            <div class="col-1">

            </div>

            <div class="col-2">
                <div> <h1>Friends</h1> </div>
                <div class="friends-wrap">
                    
                    <UserItem v-for="friend in friends" :key="friend.id" 
                        v-bind:user="friend"
                        v-bind:className="'friend'"
                        v-bind:onlineStatus="true"
                        >
                    </UserItem>
                </div>     

                <div class="button-wrap"><button class="btn">More friends</button></div>       
            </div>
        </div>

    </div>
</template>

<script lang="ts">
    declare const require: any
    import {defineComponent} from 'vue';
    import Menu              from '../../components/Menu.vue';
    import User              from '../../types/User';
    import UserItem          from "../../components/UserItem.vue";

 
    export default defineComponent({
        
        components: {
            Menu,
            UserItem,
        },

        data: function(){
            return {
                friends     : [] as Array<User> | undefined,
                friendsRange: 9 as number,
                friendsCount: 0 as number, 
            }
        },

        methods: {
            getFriends: async function(take: number = 10, skip: number = 0, id: number = 1): Promise<Array<User> | undefined> {
                try{
                    const res = await this.$axios.post('user/get-friends', {take: take, skip: skip, id: id});
                    if(res.status == 200){
                        this.friendsCount += res.data.friends.length;
                        return res.data.friends;
                    }
                }catch(err){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: 'Error with query',
                    });
                    throw new Error(err);
                }
            },
        },

        mounted: async function(){

            if(this.$route.query.id == undefined){
                // this.$route.push('404');
                return;
            }
            
            this.friends = await this.getFriends(this.friendsRange, this.friendsCount, Number (this.$route.query.id));
        },

        // created: function(){
            
        // },
        
    });
</script>

<style lang="scss">
    @import '../../assets/scss/pages/user/view.scss';
</style>
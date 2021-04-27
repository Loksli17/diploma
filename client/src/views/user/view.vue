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

                <div class="button-wrap"><button @click="moreFriendsEvt" class="btn">More friends</button></div>       
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

            moreFriendsEvt: async function(){
                console.log('keeeek');
                const newFriends: Array<User> | undefined = await this.getFriends(this.friendsRange, this.friendsCount);

                if(newFriends == undefined){
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../../assets/flash/fail.svg"),
                        text: `Error with query`,
                    });
                    return;
                }

                if(!newFriends.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../../assets/flash/warning.svg"),
                        text: `You don't have more friends`,
                    });
                }

                this.friends = this.friends?.concat(newFriends);
            }
        },


        created: async function(){
            
            // if(this.$route.query.id == undefined){
            //     this.$router.push('/404');
            //     return;
            // }

            console.log(this.$route.query.id);
            
            this.friends = await this.getFriends(this.friendsRange, this.friendsCount, Number (this.$route.query.id));
        },
        
    });
</script>

<style lang="scss">
    @import '../../assets/scss/pages/user/view.scss';
</style>
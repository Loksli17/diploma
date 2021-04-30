<template>
    <div class="menu">

        <div class="col">
            <router-link @click="cleanActiveTab" class="user-show-link" :to="'/'"><img :src="require(`../assets/home-icon.svg`)" alt=""></router-link>
        </div>

        <div class="col">
            <div class="tab-wrap">
                <ul>
                    <li v-for="(tab, ind) in tabs" :key="tab.name" >
                        <router-link @click="setActiveTab(ind)" :class="{'active-tab': tab.isActive}" class="user-show-link" :to="'/project?id=' + tab.link">
                            <span>{{tab.name}}</span>
                        </router-link>
                        <div class="close" @click="removeTab(tab)">&#10006;</div>
                    </li>
                </ul>
            </div>
        </div>

        <div class="col">
            
            <div class="notific">
                <img :src="require(`../assets/bell-icon.svg`)" alt="">
            </div>

            <div class="user-identity" v-on:click="showUserMenu = !showUserMenu">
                <div v-click-outside="hideUserMenu" class="user-login">
                    <span>{{user.login}}</span>
                </div>
                <div :style="{backgroundImage: 'url(' + require(`../assets/user-avatar/${user.avatar}`) + ')'}" class="user-avatar"></div>
            </div>

            <transition name="userShow">
                <div v-if="showUserMenu" class="user-menu">
                    <ul>
                        <li>
                            <router-link @click="cleanActiveTab" class="user-show-link" :to="'/'">Home</router-link>
                        </li>
                        <li>
                            <router-link @click="cleanActiveTab" class="user-show-link" :to="'/user/edit'">Settings</router-link>
                        </li>
                        <li>
                            <router-link class="user-show-link" @click="reloadParent" :to="`/user/view?id=${user.id}`">View myself page</router-link>
                        </li>
                        <li>
                            <router-link @click="cleanActiveTab" class="user-show-link" :to="'/logout'">Log out</router-link>
                        </li>
                    </ul>
                </div>
            </transition>

        </div>
    </div>
</template>


<script lang="ts">
    declare const require: any
    import {defineComponent} from "vue";
    import User              from "../types/User";
    import Project           from "../types/Project";

    export interface Tab{
        name: string;
        link: number;
        isActive: boolean;
    }

    export default defineComponent({

        data: function(){
            return{
                showUserMenu: false,
                user        : {} as User,
                tabs        : [] as Array<Tab>,
            }           
        },

        methods: {

            reloadParent: function(): void{
                this.cleanActiveTab();
                this.$emit("reload-page");
            },

            hideUserMenu: function(): void{
                this.showUserMenu = false;
            },

            
            addTab: function(project: Project): void{
                
                for(let i: number = 0; i < this.tabs.length; i++){
                    if(this.tabs[i].link == project.id){
                        //todo open project with this link
                        return;
                    }
                }

                if(this.tabs.length == 10){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: `You cannot delete this project`,
                    });
                    return;
                }

                const tab: Tab = {name: project.name, link: project.id, isActive: false};
                this.tabs.push(tab);
                this.$store.commit('setTabs', this.tabs);

            },

            removeTab: function(tab: Tab): void{
                const ind: number = this.tabs.findIndex((item) => {item.link == tab.link});
                this.tabs.splice(ind, 1);
                this.$store.commit('setTabs', this.tabs);
            },

            cleanActiveTab: function(): void{
                this.tabs.map((item) => {
                    item.isActive = false;
                    return item;
                });

                this.$store.commit('setTabs', this.tabs);
            },

            setActiveTab(ind: number): void{

                this.tabs.map((item: Tab) => {
                    item.isActive = item.link == this.tabs[ind].link;
                    return item;
                });

                this.$store.commit('setTabs', this.tabs);
            },
        },

        created: function(){
            if(this.$store.state.userIdentity == null){
                return;
            }
            this.user = this.$store.state.userIdentity;

            if(this.$store.state.tabs != null){
                this.tabs = this.$store.state.tabs;
            }
        },
        
    });
</script>


<style lang="scss">

    @import '../assets/scss/_index.scss';
</style>
<template>
    <div class="page-project">
        <Menu></Menu>

        <div class="page-wrap">

            <div class="project-buttons-wrap">

                <div :title="button.name" v-for="button in settingsButtons" :key="button.name" class="settings-button" :class="{padding: button.padding, border: button.border, 'first-border': button.firstBorder}">
                    <img :src="require(`@/assets/settings-items/${button.icon}`)" alt="" @click="showSettingsMenu">
                    <span v-if="button.text">{{button.text}}</span>
                </div>

            </div>

            <div class="draw-buttons-wrap">

                <!-- <div class="settings draw-button">
                    <img :src="require('@/assets/draw-items/settings.svg')" alt="" @click="showSettingsMenu">
                </div> -->

                <div :title="button.name" v-for="(button, index) in drawButtons" :key="button.name" class="draw-button" :class="{'active-draw-button': button.isActive}">
                    <img :src="require(`@/assets/draw-items/${button.icon}`)" alt="" @click="setCanvasState(button, index)">
                </div>

            </div>

            <div class="users-wrap">
                <div class="user" v-for="user in users" :key="user.id" :title="user.firstName + ' ' + user.lastName" >
                    <div class="avatar" v-if="!user.avatar.includes('default-user')" :style="{backgroundImage: 'url(' + require(`@/assets/user-avatar/${user.avatar}`) + ')'}"></div>
                    <span v-else>{{user.firstName[0]}} {{user.lastName[0]}}</span>
                </div>
            </div>

            <div class="elems-wrap">

            </div>

            <div class="work-area">
                <div>
                    <canvas id="canvas-animate" width="1200" height="700" ref="canvasAnimate"></canvas>
                    <canvas id="canvas-main" width="1200" height="700" ref="canvas" @mousemove="mouseMove" @click="canvasClick"></canvas>
                </div>
            </div>
            
        </div> 
    </div>
</template>


<script lang="ts">
    declare const require: any;
    import {defineComponent} from 'vue';
    import UserCanvas        from '../canvas/UserCanvas';
    import Project           from '../types/Project';
    import Canvas, {State}   from '../canvas/Canvas';


    export default defineComponent({

        data: function(){
            return {
                projectId: 0 as number,
                project  : {} as Project | undefined,
                users    : [] as Array<UserCanvas>,
                canvas   : {} as Canvas,


                settingsButtons: [
                    {name: 'Back',     icon: 'back-arrow.svg',    text: null,     click: "", padding: true},
                    {name: 'Forward',  icon: 'forward-arrow.svg', text: null,     click: "", padding: true},
                    {name: 'Settings', icon: 'settings.svg',      text: null,     click: "", padding: true},
                    {name: 'Save',     icon: 'save.svg',          text: 'Save',   click: "", border: true, firstBorder: true},
                    {name: 'Import',   icon: 'import.svg',        text: 'Import', click: "", border: true},
                    {name: 'Export',   icon: 'export.svg',        text: 'Export', click: "", border: true},
                    {name: 'Reset',    icon: 'reset.svg',         text: 'Reset',  click: "", border: true},
                ],

                drawButtons: [
                    {name: 'Brush', icon: "brush.svg", state: State.BRUSH, isActive: false},
                    {name: 'Line',  icon: "line.svg",  state: State.LINE, isActive: false},
                ],
            }
        },

        mounted: async function(){

            this.projectId = Number(this.$route.query.id);
            this.project   = await this.getProject();
            
            if(this.project == undefined) return;

            const user: UserCanvas = this.$store.state.userIdentity!;

            user.color  = "#000";
            user.cursor = {x: 0, y: 0};

            this.users.push(user);

            if(this.project.users!.length){
                //todo connect to project room socket
                this.$socket.emit('joinProject', {userId: this.$store.state.userIdentity!.id, projectId: this.projectId});
            }

            this.canvas = new Canvas(
                this.$refs.canvas as HTMLCanvasElement,
                this.$refs.canvasAnimate as HTMLCanvasElement,
                this.users,
            );
        },


        created: function(){

            this.$socket.on('joinProject', (data: any) => {
                data.users = data.users.map((item: any) => {
                    const user: UserCanvas = item;
                    user.color  = "#000";
                    user.cursor = {x: 0, y: 0};
                    return user;
                });
                this.users = data.users;
            });

            this.$socket.on('leaveProject', (data: any) => {
                const ind: number = this.users.findIndex(item => item.id == data.id);
                this.users.splice(ind, 1);
            });

            this.$socket.on('mouseMove', (data: any) => {
                const x = 228;
            });

            
        },

        methods: {

            getProject: async function(){
                
                try {
                    const res = await this.$axios.post('/project/get-project', {
                        id: this.projectId,
                    });

                    if(res.status == 200){
                        return res.data.project;
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


            setCanvasState: function(btn: any, index: number){
                this.canvas.setState(btn.state);
                console.log(this.canvas.getState(), index);

                this.drawButtons.forEach(item => {
                    item.isActive = false;
                });
                this.drawButtons[index].isActive = true;
            },

            canvasClick: function(e: any){

                const
                    bounds = e.target.getBoundingClientRect(),
                    x      = e.clientX - bounds.left,
                    y      = e.clientY - bounds.top;

                console.log({x: x, y: y});
                this.canvas.click({x: x, y: y});
            },

            mouseMove: function(e: any){

                const
                    bounds = e.target.getBoundingClientRect(),
                    x      = e.clientX - bounds.left,
                    y      = e.clientY - bounds.top;

                this.canvas.mouseMove({x: x, y: y});

                this.$socket.emit('mouseMove', {
                    userId   : this.$store.state.userIdentity!.id,
                    projectId: this.projectId,
                    x        : x,
                    y        : y, 
                });
            },
        },
    });
</script>


<style lang="scss">
    @import '../assets/scss/pages/project.scss';
</style>
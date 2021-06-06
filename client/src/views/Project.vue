<template>
    <div class="page-project">
        <Menu></Menu>

        <div class="page-wrap">

            <div class="project-buttons-wrap">

                <div @click="settingsButtonClick(button.click)" :title="button.name" v-for="button in settingsButtons" :key="button.name" class="settings-button" :class="{padding: button.padding, border: button.border, 'first-border': button.firstBorder}">
                    <img :src="require(`@/assets/settings-items/${button.icon}`)" alt="">
                    <span v-if="button.text">{{button.text}}</span>
                </div>

            </div>

            <div v-if="showSettingsMenu" class="settings-menu">
                
                <div class="row">
                    <span>Width:</span>
                    <input type="number" min="1" max="10" v-model="canvas.brushWidth">
                </div>

                <div class="row">
                    <span>Color:</span>
                    <input type="color" v-model="canvas.brushColor">
                </div>

                <div class="row">
                    <span>Fill shape:</span>
                    <input type="checkbox" v-model="canvas.fillStatus">
                </div>

                <div class="row">
                    <span>Area width:</span>
                    <input type="number" min="1" max="10" v-model="canvas.width">
                </div>

                <div class="row">
                    <span>Area height:</span>
                    <input type="number" min="1" max="10" v-model="canvas.height">
                </div>
            </div>

            <div class="draw-buttons-wrap">

                <div :title="button.name" v-for="(button, index) in drawButtons" :key="button.name" class="draw-button" :class="{'active-draw-button': button.isActive}" @click="setCanvasState(button, index)">
                    <img :src="require(`@/assets/draw-items/${button.icon}`)" alt="" >
                </div>

            </div>

            <div class="users-wrap">
                <div class="user" v-for="user in users" :key="user.id" :title="user.firstName + ' ' + user.lastName" >
                    <div class="avatar" v-if="!user.avatar.includes('default-user')" :style="{backgroundImage: 'url(' + require(`@/assets/user-avatar/${user.avatar}`) + ')'}"></div>
                    <span v-else>{{user.firstName[0]}} {{user.lastName[0]}}</span>
                </div>
            </div>

            <div class="elems-wrap">

                <div class="item" v-for="shape in canvas.shapes" :key="shape.name">
                    <img :src="require(`@/assets/draw-items/${shape.icon}`)">
                    <span>{{shape.name}}</span>
                </div>
            </div>

            <div class="work-area">
                <div>
                    <canvas id="canvas-animate" width="1200" height="700" ref="canvasAnimate"></canvas>
                    <canvas id="canvas-main" width="1200" height="700" ref="canvas" 
                        @mousemove="mouseMove" 
                        @click="canvasClick" 
                        @mouseover="drawCursor"
                        @mouseout="normalCursor"
                        @mousedown="mouseDown"
                        @mouseup="mouseUp"
                        >
                    </canvas>
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
    import Shape             from '../canvas/shapes/Shape';


    export default defineComponent({

        data: function(){
            return {
                projectId: 0 as number,
                project  : {} as Project | undefined,
                users    : [] as Array<UserCanvas>,
                canvas   : {} as Canvas,

                oldShapesState: [] as Array<Shape>,

                showSettingsMenu: false as boolean,

                settingsButtons: [
                    {name: 'Back',     icon: 'back-arrow.svg',    text: null,     click: 'goBack',           padding: true},
                    {name: 'Forward',  icon: 'forward-arrow.svg', text: null,     click: "goForward",        padding: true},
                    {name: 'Settings', icon: 'settings.svg',      text: null,     click: "openSettingsMenu", padding: true},
                    {name: 'Save',     icon: 'save.svg',          text: 'Save',   click: "saveProject",      border: true, firstBorder: true},
                    {name: 'Import',   icon: 'import.svg',        text: 'Import', click: "importProject",    border: true},
                    {name: 'Export',   icon: 'export.svg',        text: 'Export', click: "exportProject",    border: true},
                    {name: 'Reset',    icon: 'reset.svg',         text: 'Reset',  click: "reset",            border: true},
                ],

                drawButtons: [
                    {name: 'Brush',              icon: "brush.svg",              state: State.BRUSH,             isActive: false},
                    {name: 'Line',               icon: "line.svg",               state: State.LINE,              isActive: false},
                    {name: 'Rectangle',          icon: "rect.svg",               state: State.RECT,              isActive: false},
                    {name: 'Circle',             icon: "circle.svg",             state: State.CIRCLE,            isActive: false},
                    {name: 'Isosceles triangle', icon: "isosceles-triangle.svg", state: State.ISOSCELESTRIANGLE, isActive: false},
                    {name: 'Right triangle',     icon: "right-triangle.svg",     state: State.RIGHTTRIANGLE,     isActive: false},
                    {name: 'Bezier',             icon: "bezier.svg",             state: State.BEZIER,            isActive: false}, 
                    {name: 'Ellipse',            icon: "ellipse.svg",            state: State.ELLIPSE,           isActive: false},            
                ],
            }
        },

        mounted: async function(){

            this.projectId = Number(this.$route.query.id);
            
            const data: {project: Project; shapes: Array<Shape>} = await this.getProject();
            this.project = data.project;
            
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
            
            this.canvas.addShapes(data.shapes);
            this.canvas.renderAll();

            this.oldShapesState = this.canvas.shapes.slice();
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

            mouseDown: function(e: any){

                if(this.drawButtons.filter(item => item.isActive!)[0].state != State.BRUSH) return;

                const
                    bounds = e.target.getBoundingClientRect(),
                    x      = e.clientX - bounds.left,
                    y      = e.clientY - bounds.top;

                this.canvas.click({x: x, y: y}, this.$store.state.userIdentity!.id);
            },


            mouseUp: function(e: any){

                if(this.drawButtons.filter(item => item.isActive!)[0].state != State.BRUSH) return;

                const
                    bounds = e.target.getBoundingClientRect(),
                    x      = e.clientX - bounds.left,
                    y      = e.clientY - bounds.top;

                this.canvas.click({x: x, y: y}, this.$store.state.userIdentity!.id);
            },

            settingsButtonClick: function(name: string){

                switch(name){
                    case "goBack"          : this.goBack(); break;
                    case "goForward"       : this.goForward(); break;
                    case "openSettingsMenu": this.openSettingsMenu(); break;
                    case "saveProject"     : this.saveProject(); break;
                    case "reset"           : this.reset(); break;
                 }
            },

            goBack: function(){
                this.canvas.backStep();
            },

            goForward: function(){
                this.canvas.forwardStep();
            },

            reset: function(){
                this.canvas.shapes = this.oldShapesState.slice();
                this.canvas.renderAll();
            },

            saveProject: async function(){

                try {
                    const res: any = await this.$axios.post('project/save-file', {
                        id: this.project!.id,
                        shapes: this.canvas.shapes,
                    });

                    if(res.status == 400){
                        this.$flashMessage.show({
                            type: 'error',
                            image: require("../assets/flash/fail.svg"),
                            text: res.data.msg,
                        });
                        return;  
                    }

                    this.$flashMessage.show({
                        type: 'success',
                        image: require("../assets/flash/success.svg"),
                        text: res.data.msg,
                    });
                }catch(err){
                    console.error(err);
                    this.$flashMessage.show({
                        type: 'error',
                        image: require("../assets/flash/fail.svg"),
                        text: `Error with query`,
                    }); 
                }
            },

            openSettingsMenu: function(){
                this.showSettingsMenu = !this.showSettingsMenu;
            },

            getProject: async function(){
                
                try {
                    const res = await this.$axios.post('/project/get-project', {
                        id: this.projectId,
                    });

                    if(res.status == 200){
                        return res.data;
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

                this.drawButtons.forEach(item => {
                    item.isActive = false;
                });
                this.drawButtons[index].isActive = true;
            },

            canvasClick: function(e: any){

                if(this.drawButtons.filter(item => item.isActive!)[0].state == State.BRUSH) return;

                const
                    bounds = e.target.getBoundingClientRect(),
                    x      = e.clientX - bounds.left,
                    y      = e.clientY - bounds.top;

                this.canvas.click({x: x, y: y}, this.$store.state.userIdentity!.id);
            },

            mouseMove: function(e: any){

                if(this.canvas == undefined) return;

                const
                    bounds = e.target.getBoundingClientRect(),
                    x      = e.clientX - bounds.left,
                    y      = e.clientY - bounds.top;

                this.canvas.mouseMove({x: x, y: y}, this.$store.state.userIdentity!.id);

                this.$socket.emit('mouseMove', {
                    userId   : this.$store.state.userIdentity!.id,
                    projectId: this.projectId,
                    x        : x,
                    y        : y, 
                });
            },

            drawCursor: function(){
                document.body.style.cursor = "crosshair";
            },

            normalCursor: function(){
                document.body.style.cursor = "default"
            }
        },
    });
</script>


<style lang="scss">
    @import '../assets/scss/pages/project.scss';
</style>
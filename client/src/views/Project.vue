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
                    <input type="number" min="200" max="2000" v-model="canvas.width">
                </div>

                <div class="row">
                    <span>Area height:</span>
                    <input type="number" min="200" max="2000" v-model="canvas.height">
                </div>
            </div>

            <div v-if="showExportMenu" class="export-menu">
                
                <div class="row">
                    <span @click="createJson">JSON</span>
                </div>

                <div class="row">
                    <span @click="createImage('png')">PNG</span>
                </div>

                <div class="row">
                    <span @click="createImage('jpeg')">JPEG</span>
                </div>
            </div>

            <div v-if="showImportMenu" class="import-menu">

                <form :class="{'form-active': fileOverStatus}" id="fileForm" ref="fileForm" @drop.prevent="fileDrop" @dragenter.prevent @dragover.prevent="fileOver" @dragleave="fileLeave">
                    <span>Drop new image here</span>
                </form>

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
                <!-- <vue-resizable> -->
                    <div @resize="resize" ref="canvasWrap">
                        <canvas id="canvas-animate" width="1200" height="700" ref="canvasAnimate"
                            @mousemove="mouseMove" 
                            @click="canvasClick" 
                            @mouseover="drawCursor"
                            @mouseout="normalCursor"
                            @mousedown="mouseDown"
                            @mouseup="mouseUp"
                        ></canvas>
                        <canvas id="canvas-main" width="1200" height="700" ref="canvas"></canvas>
                    </div>
                <!-- </vue-resizable> -->
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
    import VueResizable      from 'vue-resizable';


    export default defineComponent({

        data: function(){
            return {
                projectId: 0 as number,
                project  : {} as Project | undefined,
                users    : [] as Array<UserCanvas>,
                canvas   : {} as Canvas,

                oldShapesState: [] as Array<Shape>,

                showSettingsMenu: false as boolean,
                showExportMenu  : false as boolean,
                showImportMenu  : false as boolean,
                fileOverStatus  : false as boolean,

                settingsButtons: [
                    {name: 'Back',     icon: 'back-arrow.svg',    text: null,     click: 'goBack',             padding: true},
                    {name: 'Forward',  icon: 'forward-arrow.svg', text: null,     click: "goForward",          padding: true},
                    {name: 'Settings', icon: 'settings.svg',      text: null,     click: "toggleSettingsMenu", padding: true},
                    {name: 'Save',     icon: 'save.svg',          text: 'Save',   click: "saveProject",        border: true, firstBorder: true},
                    {name: 'Import',   icon: 'import.svg',        text: 'Import', click: "toggleImportMenu",   border: true},
                    {name: 'Export',   icon: 'export.svg',        text: 'Export', click: "toggleExportMenu",   border: true},
                    {name: 'Reset',    icon: 'reset.svg',         text: 'Reset',  click: "reset",              border: true},
                ],

                drawButtons: [
                    {name: 'Cursor',             icon: "cursor.svg",             state: State.CURSOR,           isActive: true},
                    {name: 'Brush',              icon: "brush.svg",              state: State.BRUSH,             isActive: false},
                    {name: 'Line',               icon: "line.svg",               state: State.LINE,              isActive: false},
                    {name: 'Rectangle',          icon: "rect.svg",               state: State.RECT,              isActive: false},
                    {name: 'Circle',             icon: "circle.svg",             state: State.CIRCLE,            isActive: false},
                    {name: 'Isosceles triangle', icon: "isosceles-triangle.svg", state: State.ISOSCELESTRIANGLE, isActive: false},
                    {name: 'Right triangle',     icon: "right-triangle.svg",     state: State.RIGHTTRIANGLE,     isActive: false},
                    {name: 'Bezier',             icon: "bezier.svg",             state: State.BEZIER,            isActive: false}, 
                    {name: 'Ellipse',            icon: "ellipse.svg",            state: State.ELLIPSE,           isActive: false},
                    {name: 'Rhombus',            icon: "rhombus.svg",            state: State.RHOMBUS,           isActive: false}, 
                    {name: 'Arrow',              icon: "arrow.svg",              state: State.ARROW,             isActive: false},      
                ],
            }
        },

        // components: {VueResizable},

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

            fileOver: function(e: any){
                this.fileOverStatus = true;
            },

            fileLeave: function(){
                this.fileOverStatus = false;
            },

            fileDrop: function(e: any){

                const
                    reader: FileReader = new FileReader(), 
                    file: File = e.dataTransfer.files[0];

                switch(file.type){
                    case 'application/json':
                        reader.readAsText(file);
                        reader.addEventListener('load', (e: any) => {
                            const data: Array<Shape> = JSON.parse(JSON.parse(e.target.result));
                            this.canvas.addShapes(data);
                            this.canvas.renderAll();
                            this.$flashMessage.show({
                                type: 'success',
                                image: require("../assets/flash/success.svg"),
                                text: 'File has been imported successfully',
                            });
                        })
                        break;
                    default: 
                        this.$flashMessage.show({
                            type: 'warning',
                            image: require("../assets/flash/warning.svg"),
                            text: 'Format of file must be JSON',
                        });
                }

                this.fileOverStatus = false;
            },

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
                    case "goBack"            : this.goBack(); break;
                    case "goForward"         : this.goForward(); break;
                    case "toggleSettingsMenu": this.toggleSettingsMenu(); break;
                    case "saveProject"       : this.saveProject(); break;
                    case "reset"             : this.reset(); break;
                    case "toggleExportMenu"  : this.toggleExportMenu(); break;
                    case "toggleImportMenu"  : this.toggleImportMenu(); break;
                 }
            },

            createImage: function(type: string){

                if(!this.canvas.shapes.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: 'No data for export',
                    });
                    return;
                }
                
                const canvas = this.$refs.canvas! as any;
 
                const link: HTMLElement = document.createElement('a');
                link.setAttribute('href', canvas.toDataURL(`image/${type}`).replace(`image/${type}`, "image/octet-stream"));
                link.setAttribute('download', `${this.project!.name}.${type}`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            },

            createJson: function(){

                if(!this.canvas.shapes.length){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: 'No data for export',
                    });
                    return;
                }

                const json: string = JSON.stringify(this.canvas.shapes);

                const data: string = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
                const dlAnchorElem: HTMLElement = document.createElement('a');
                dlAnchorElem.setAttribute("href", data);
                dlAnchorElem.setAttribute("download", `${this.project!.name}.json`);
                document.body.appendChild(dlAnchorElem);
                dlAnchorElem.click();
                dlAnchorElem.remove();
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
                
                if(this.canvas.shapes.length == 0){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: 'Nothing to save',
                    });
                    return;
                }

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

            toggleSettingsMenu: function(){
                this.showSettingsMenu = !this.showSettingsMenu;
                this.showExportMenu   = false;
                this.showImportMenu   = false;
            },

            toggleExportMenu: function(){
                this.showExportMenu   = !this.showExportMenu;
                this.showSettingsMenu = false;
                this.showImportMenu   = false;
            },

            toggleImportMenu: function(){
                this.showImportMenu   = !this.showImportMenu;
                this.showSettingsMenu = false;
                this.showExportMenu   = false;
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
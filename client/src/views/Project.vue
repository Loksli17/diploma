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

                <div class="row">
                    <span>Background color:</span>
                    <input type="color" @change="changeBackgroundColor" v-model="backgroundColor">
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
                    <div class="avatar" v-if="!user.avatar.includes('default-user')" :style="{backgroundImage: `url(http://localhost:3000/img/avatars/${user.avatar})`}"></div>
                    <span v-else>{{user.firstName[0]}} {{user.lastName[0]}}</span>
                </div>
            </div>

            <div class="elems-wrap">

                <div class="item" v-for="shape in canvas.shapes" :key="shape.name" @click="openShapeMenu(shape)">
                    <img :src="require(`@/assets/draw-items/${shape.icon}`)">
                    <span>{{shape.name}}</span>
                    <div class="settings">
                        <div :class="{'non-visible': !shape.isVisible}" @click.stop="toggleShape(shape.id)">
                            <img :src="require(`@/assets/settings-items/eye.svg`)" alt="">
                        </div>
                        <div @click.stop="removeShape(shape)">
                            <img :src="require(`@/assets/settings-items/delete.svg`)" alt="">
                        </div>
                    </div>
                </div>
            </div>

            <ShapeMenu ref="shapeMenu" 
                v-on:change-fill="changeShapeFill" 
                v-on:change-color="changeShapeColor" 
                v-on:change-width="changeShapeWidth"
                v-on:change-name="changeShapeName"
            >
            </ShapeMenu>

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
                        <canvas id="canvas-mouse" width="1200" height="700" ref="canvasMouse"></canvas>
                        <canvas id="canvas-main"  width="1200" height="700" ref="canvas"></canvas>
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
    import ShapeMenu         from '../components/ShapeMenu.vue';
    import VueResizable      from 'vue-resizable';
    import Cursor            from '../canvas/Cursor';


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

                backgroundColor: '#FFFFFF' as string,

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

        components: {
            ShapeMenu,
            // VueResizable
        },

        mounted: async function(){
            
            this.projectId = Number(this.$route.query.id);

            const access: boolean | undefined = await this.checkAccess();

            if(!access){
                this.$router.push('404');
            }
        
            const data: {project: Project; canvas: Canvas} = await this.getProject();
            this.project = data.project;
            
            if(this.project == undefined) return;

            const user: UserCanvas = this.$store.state.userIdentity!;

            user.color  = "#000";
            user.cursor = {x: 0, y: 0};

            this.users.push(user);

            if(this.project.users!.length){
                this.$socket.emit('joinProject', {userId: this.$store.state.userIdentity!.id, projectId: this.projectId});
            }

            this.canvas = new Canvas(
                this.$refs.canvas as HTMLCanvasElement,
                this.$refs.canvasAnimate as HTMLCanvasElement,
                this.$refs.canvasMouse as HTMLCanvasElement,
                this.users,
                this.$socket,
                this.$store.state.userIdentity!,
                this.projectId,
            );

            if(data.canvas != undefined){
                this.canvas.backgroundColor = data.canvas.backgroundColor;
                this.canvas.width           = data.canvas.width;
                this.canvas.height          = data.canvas.height;
                
                this.canvas.addShapes(data.canvas.shapes);
                this.canvas.renderAll();

                this.oldShapesState = this.canvas.shapes.slice();
            }

            this.backgroundColor = this.canvas.backgroundColor;

        },

        created: function(){

            this.$socket.on('joinProject', (data: any) => {

                if(this.projectId != data.projectId) return;

                data.users = data.users.map((item: any) => {
                    const user: UserCanvas = item;
                    user.color  = "#000";
                    user.cursor = {x: 0, y: 0};
                    return user;
                });

                this.users        = data.users;
                this.canvas.users = data.users;

                this.canvas.cursors = [];
                data.users.forEach((item: any) => {
                    if(item.id != this.$store.state.userIdentity!.id){
                        this.canvas.cursors.push(new Cursor(item.firstName, item.lastName, item.id))
                    }
                });

                let maxId: number = 0;
                data.users.forEach((item: any) => {
                    if(data.user.id != item.id && item.id > maxId) { maxId = item.id; } 
                });

                if(maxId == this.$store.state.userIdentity!.id){   
                    delete this.canvas.socket;
                    this.$socket.emit('sinhronizeData', {
                        canvas   : JSON.stringify(this.canvas), 
                        userId   : data.user.id,
                        projectId: this.projectId,
                    });
                    this.canvas.socket = this.$socket;
                }   
                
            });


            this.$socket.on('sinhronizeData', (data: any) => {

                if(this.projectId != data.projectId) return;

                this.canvas.shapes = [];
                this.canvas.copyData(JSON.parse(data.canvas));
                this.canvas.renderAll();
            });


            this.$socket.on('resetCanvas', (data: any) => {

                if(this.projectId != data.projectId) return;

                this.canvas.shapes = [];
                this.canvas.copyData(JSON.parse(data.canvas));
                this.canvas.renderAll();
            });


            this.$socket.on('leaveProject', (data: any) => {
                

                let ind: number = this.users.findIndex(item => item.id == data.userId);
                this.users.splice(ind, 1);

                ind = this.canvas.cursors.findIndex(item => item.userId == data.userId);
                this.canvas.cursors.splice(ind, 1);

                this.canvas.renderCursors();
            });


            this.$socket.on('mouseMove', (data: any) => {

                if(this.canvas.cursors == undefined) return;

                this.canvas.cursors.map(item => {
                    if(data.userId == item.userId){
                        item.x = data.x;
                        item.y = data.y;
                        this.canvas.renderCursors();
                    }
                    return item;
                })
            });


            this.$socket.on('drawShape', (data: any) => {
                
                if(this.projectId != data.projectId) return;
                if(data.user.id == this.$store.state.userIdentity!.id) return;
                
                this.canvas.addShape(data.shape);
                this.canvas.renderAll();
            });


            this.$socket.on('changeCanvas', (data: any) => {

                if(data.userId == this.$store.state.userIdentity!.id) return;
                
                this.canvas.setBackground(data.color);

                this.canvas.height = data.height;
                this.canvas.width  = data.width;
            });
            

            this.$socket.on('removeShape', (data: any) => {
                if(data.userId == this.$store.state.userIdentity!.id) return;

                this.canvas.removeShape(data.shape);
                this.canvas.renderAll();

                const menu = this.$refs.shapeMenu! as any;

                if(menu == null) return; 
                menu.close();
            });


            this.$socket.on('changeShape', (data: any) => {
                if(data.userId == this.$store.state.userIdentity!.id) return;

                console.log(data);

                this.canvas.changeShape(data.shape);
                this.canvas.renderAll();
            });
        },


        methods: {

            changeBackgroundColor: function(){
                this.canvas.setBackground(this.backgroundColor);

                this.$socket.emit('changeCanvas', {
                    color    : this.backgroundColor,
                    height   : this.canvas.height,
                    width    : this.canvas.width,
                    userid   : this.$store.state.userIdentity!.id,
                    projectId: this.projectId
                });
            },

            openShapeMenu: function(shape: Shape){
                const menu = this.$refs.shapeMenu! as any;
                menu.setShape(shape);
                menu.show();
            },

            changeShapeColor: function(shape: Shape){
                this.$socket.emit('changeShape', {
                    shape    : shape,
                    userId   : this.$store.state.userIdentity!.id,
                    projectId: this.projectId,
                });
                this.canvas.renderAll();
            },

            changeShapeWidth: function(shape: Shape){
                this.$socket.emit('changeShape', {
                    shape    : shape,
                    userId   : this.$store.state.userIdentity!.id,
                    projectId: this.projectId,
                });
                this.canvas.renderAll();
            },

            changeShapeFill: function(shape: Shape){
                this.$socket.emit('changeShape', {
                    shape    : shape,
                    userId   : this.$store.state.userIdentity!.id,
                    projectId: this.projectId,
                });
                this.canvas.renderAll();
            },

            changeShapeName: function(shape: Shape){
                this.$socket.emit('changeShape', {
                    shape    : shape,
                    userId   : this.$store.state.userIdentity!.id,
                    projectId: this.projectId,
                });
                this.canvas.renderAll();
            },

            toggleShape: function(id: number){
                const shape: Shape | undefined = this.canvas.shapes.find(item => item.id == id);
                if(shape == undefined) return;
                shape.isVisible = !shape.isVisible;
                this.canvas.renderAll();
            },

            removeShape: function(shape: Shape){

                this.canvas.removeShape(shape);
                this.canvas.renderAll();

                const menu = this.$refs.shapeMenu! as any;
                menu.close();

                this.$socket.emit('removeShape', {
                    userId   : this.$store.state.userIdentity!.id,
                    projectId: this.projectId,
                    shape    : shape,
                });
            },

            fileOver: function(){
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
                            const data: Canvas = JSON.parse(JSON.parse(e.target.result));

                            this.canvas.backgroundColor = data.backgroundColor;
                            this.canvas.width           = data.width;
                            this.canvas.height          = data.height;

                            this.canvas.addShapes(data.shapes);
                            this.canvas.renderAll();

                            this.oldShapesState = this.canvas.shapes.slice();

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

                if(type == 'png' && this.backgroundColor.toUpperCase() == '#FFFFFF'){
                    this.canvas.renderForPng();
                }
 
                const link: HTMLElement = document.createElement('a');
                link.setAttribute('href', canvas.toDataURL(`image/${type}`).replace(`image/${type}`, "image/octet-stream"));
                link.setAttribute('download', `${this.project!.name}.${type}`);
                document.body.appendChild(link);
                link.click();
                link.remove();

                if(type == 'png' && this.backgroundColor.toUpperCase() == '#FFFFFF'){
                    this.canvas.renderAll();
                }
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

                const json: string = JSON.stringify(this.canvas);

                const data: string = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
                const dlAnchorElem: HTMLElement = document.createElement('a');
                dlAnchorElem.setAttribute("href", data);
                dlAnchorElem.setAttribute("download", `${this.project!.name}.json`);
                document.body.appendChild(dlAnchorElem);
                dlAnchorElem.click();
                dlAnchorElem.remove();
            },

            goBack: function(){
                this.canvas.backStepHistory();
            },

            goForward: function(){
                this.canvas.forwardStepHistory();
            },

            reset: function(){
                this.canvas.shapes = this.oldShapesState.slice();
                this.canvas.renderAll();

                delete this.canvas.socket;
                this.$socket.emit('resetCanvas', {canvas: JSON.stringify(this.canvas), projectId: this.projectId});
                this.canvas.socket = this.$socket;
            },

            saveProject: async function(){

                const canvas = this.$refs.canvas! as any;
                
                if(this.canvas.shapes.length == 0){
                    this.$flashMessage.show({
                        type: 'warning',
                        image: require("../assets/flash/warning.svg"),
                        text: 'Nothing to save',
                    });
                    return;
                }

                try {

                    delete this.canvas.socket;

                    const res: any = await this.$axios.post('project/save-file', {
                        id    : this.project!.id,
                        canvas: JSON.stringify(this.canvas),
                        data  : canvas.toDataURL(`image/png`).replace(`image/png`, "image/octet-stream"),
                    });

                    if(res.status == 400){
                        this.$flashMessage.show({
                            type: 'error',
                            image: require("../assets/flash/fail.svg"),
                            text: res.data.msg,
                        });
                        return;  
                    }

                    this.canvas.socket = this.$socket;

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

            checkAccess: async function(): Promise<boolean | undefined>{

                try {
                    const res = await this.$axios.post('/project/check-access', {
                        projectId: this.projectId,
                        userId   : this.$store.state.userIdentity!.id,
                    });

                    if(res.status == 200){
                        return res.data.access;
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
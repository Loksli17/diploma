<template>
    <div ref="wrap" v-if="activeStatus" class="shape-menu" @mousedown="dragMouseDown">
        <div class="row">
            <h1>{{shape.name}}</h1>
        </div>
        <div class="row">
            <span>Type: {{type}}</span>
        </div>
        <div class="row">
            <span>Color</span>
            <input type="color" v-model="shape.color">
        </div>
        <div class="row">
            <span>Name</span>
            <input type="text" v-model="shape.name">
        </div>
        <div class="row">
            <button @click="close" class="btn">Close</button>
        </div>
    </div>
</template>


<script lang="ts">
    import {defineComponent} from 'vue';
    import Shape             from '../canvas/shapes/Shape';


    export default defineComponent({
        
        data: function(){
            return {
                activeStatus: false as boolean,
                shape       : {name: '', color: '#ffffff', } as Shape,
                type        : '' as string,

                positions: {
                    clientX: undefined as number | undefined,
                    clinetY: undefined as number | undefined,
                    movementX: 0,
                    movementY: 0
                }
            }
        },

        methods: {
            close: function(){
                this.activeStatus = false;
            },

            setShape: function(shape: Shape){
                this.shape = shape;
                this.type  = shape.icon.slice(0, -4);
            },

            show: function(){
                this.activeStatus = true;
            },

            dragMouseDown(e: MouseEvent) {
                e.preventDefault();

                this.positions.clientX = e.clientX;
                this.positions.clinetY = e.clientY;
                document.onmousemove = this.elementDrag;
                document.onmouseup = this.closeDragElement;
            },

            elementDrag(e: MouseEvent) {
                e.preventDefault();
                this.positions.movementX = (this.positions.clientX ?? 0) - e.clientX;
                this.positions.movementY = (this.positions.clinetY ?? 0) - e.clientY;

                [this.positions.clientX, this.positions.clinetY] = [e.clientX, e.clientY];
                
                const container = this.$refs.wrap as HTMLElement;
                container.style.top = (container.offsetTop - this.positions.movementY) + "px";
                container.style.left = (container.offsetLeft - this.positions.movementX) + "px";
            },

            closeDragElement() {
                document.onmousemove = null;
                document.onmouseup = null;
            }
        },
    });
</script>

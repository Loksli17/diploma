<template>
    <div v-if="activeStatus" class="shape-menu">
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
            }
        },

        props: {
            shapeData: {
                type    : Object as () => Shape,
                required: true,
            }
        },
        
        created: function(){
            this.shape = this.shapeData;
            
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
        },
    });
</script>

<template>
    <div v-if="showStatus" class="action-back" v-on:click="showStatus = !showStatus">
        <div class="action-back-wrap" @click.stop>

            <div class="header">
                <h1>{{this.headerMainText}}</h1>
                <span>{{this.headerAddText}}</span>
            </div>

            <slot></slot>
        </div>
    </div>
</template>


<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({

    props: {
        headerMainText: {
            type    : String,
            required: true,
        },
        headerAddText: {
            type    : String,
            required: true,
        }
    },

    data: function(){
        return{
            showStatus: false,
        }
    },

    methods: {
        hide: function(){
            this.showStatus = false;
        },

        show: function(){
            this.showStatus = true;
        }
    },

});

</script>

<style lang="scss">

    .action-back{
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        z-index: 9997;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .action-back-wrap{
        background: #EFEFF5;
        padding: 50px;
        display: grid;
        row-gap: 30px;

        .header{
            display: grid;
            justify-items: left;

            span{
                text-align: left;
                color: #2DBEFC;
                font-size: 20px;
            }
        }
    }
</style>
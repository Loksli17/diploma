<template>
    <div v-if="showStatus" class="action-back" v-on:click="showStatus = !showStatus">
        <div class="action-back-wrap" @click.stop>

            <div class="header">
                <h1>{{this.headerMainText}}</h1>
                <div>
                    <template v-if="backButton">
                        <a href="" class="go-view-link" @click.prevent="goViewEvt">Go View</a>
                        <span class="separ">/</span>
                        <span class="add-text">{{this.headerAddText}}</span>
                    </template>
                    <span class="add-text add-text-one" v-else>{{this.headerAddText}}</span>
                </div>
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
        },
        overloadCloseEvt: {
            default: false,
            type   : Boolean,
        },
        overloadOpenEvt: {
            default: false,
            type   : Boolean,
        },
        backButton: {
            default: false,
            type   : Boolean,
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
            this.$emit('close-back');
        },

        show: function(){
            this.showStatus = true;
        },

        goViewEvt: function(){
            this.$emit('go-view');
        },
    },

});

</script>

<style lang="scss">

    @import '../assets/scss/base/colors.scss';
    @import '../assets/scss/utils/layout/row.scss';
    @import '../assets/scss/components/actionBack.scss';
    

    .action-back{
        @extend %actionBack;
    }
</style>
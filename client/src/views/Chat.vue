<template>
    <div class="page-chat">
        <Menu ref="globalMenu"></Menu>

    </div>
</template>


<script lang="ts">
    import {defineComponent} from 'vue';
    import Menu              from '../components/Menu.vue';

    export default defineComponent({

        components: {
            Menu,
        }
    });
</script>


<style lang="scss">

</style>
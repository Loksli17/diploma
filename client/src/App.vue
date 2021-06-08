<template>
    <FlashMessage class="flash-message" position="right bottom"/>
    <router-view :key="$route.fullPath"/>
</template>


<script></script>


<style lang="scss">

@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap');

*{
    padding: 0;
    margin: 0;    
}

#app {
    font-family: 'Lato', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

.flash-message{
    position: absolute;
    z-index: 9999;
}

</style>

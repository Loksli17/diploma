<template>
    <FlashMessage position="right bottom"/>
    <router-view/>
</template>

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

</style>

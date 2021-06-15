<template>
    <FlashMessage class="flash-message" position="right bottom"/>
    <router-view :key="$route.fullPath"/>
</template>


<script></script>


<style lang="scss">

@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap');
@import 'assets/scss/utils/layout/column.scss';

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
    opacity: 0.95;

    .success{
        background-color: #21cc7c;
    }

    .error{
        background-color: #F50A0A;
    }

    .warning{
        background-color: #eeba2b;
    }

    .info{
        background-color: #36ccf1;
    }

    ._vue-flash-msg-body{
        border-radius: 0px;
    }
    
    ._vue-flash-msg-body__content{
        @include column(10px);
        grid-auto-rows: max-content auto;
        color: #fff;
        padding: 10px 20px;

        p:first-child{
            font-size: 22px;
            letter-spacing: 0.6px;
            font-weight: 600;
        }
    }
}

</style>

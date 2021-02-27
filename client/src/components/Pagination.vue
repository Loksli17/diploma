<template>
    <div class="pages">
        <div :class="classNameData">

            <div v-if="firstPage">
                <a :href="firstPage.link" :class="firstPage.class" @click.prevent="setCurrentPageEvt">
                    {{firstPage.content}}
                </a>
            </div>

            <div v-if="prevPage">
                <a :href="prevPage.link" :class="prevPage.class" @click.prevent="setCurrentPageEvt">
                    {{prevPage.content}}
                </a>
            </div>

            <template v-for="page in pages" :key="page">
                <a :href="page.link" :class="page.class" @click.prevent="setCurrentPageEvt">
                    {{page.content}}
                </a>
            </template>

            <div v-if="nextPage">
                <a :href="nextPage.link" :class="nextPage.class" @click.prevent="setCurrentPageEvt">
                    {{nextPage.content}}
                </a>
            </div>

            <div v-if="lastPage">
                <a :href="lastPage.link" :class="lastPage.class" @click.prevent="setCurrentPageEvt">
                    {{lastPage.content}}
                </a>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';

    interface Page{
        content: string;
        class: string;
        link: number;
        current?: boolean;
    }

    export default defineComponent({

        props: {
            take: {
                type: Number,
                required: true,
            },
            currentPage: {
                type: Number,
                required: true,
            },
            pageSize: {
                type: Number,
                required: true,
            },
            amountElements: {
                type: Number,
                required: true,
            },
            className: {
                type: String,
            },
            itemClass: {
                type: String,
            },
            endButton: {
                type: Number,
            },
            startButton: {
                type: Number,
            },
            activePageClass: {
                type: String,
            },
        },

        data: function(){
            return {
                skip               : 0 as number,
                pages              : [] as Array<Page>,
                maxPage            : 0 as number,
                currentPageData    : 0 as number,
                classNameData      : '' as string,
                itemClassData      : '' as string,
                activePageClassData: '' as string,
                prevPage           : undefined as Page | undefined,
                nextPage           : undefined as Page | undefined,
                lastPage           : undefined as Page | undefined,
                firstPage          : undefined as Page | undefined,
            }
        },

        mounted: function(){
            this.init();
            this.render();
        },

        methods: {

            render: function(): void{
                const pageEndPoints: {first: number; last: number} = this.countEndPoints();
                this.pages = this.createPages(pageEndPoints.first, pageEndPoints.last);

                const stepPages: {next: Page | undefined; prev: Page | undefined} = this.createStepPages();
                this.nextPage = stepPages.next;
                this.prevPage = stepPages.prev;

                const endPointPages: {last: Page | undefined; first: Page | undefined} = this.createEndPointsPages();

                if(this.endButton){
                    this.lastPage = endPointPages.last;
                }

                if(this.startButton){
                    this.firstPage = endPointPages.first;
                }
            },
            
            init: function(): void{
                this.maxPage = Math.ceil(this.amountElements / this.take);
                this.skip    = this.take * (this.currentPage - 1);
                
                this.classNameData       = this.className       == undefined ? 'pages-wrap' : this.className;
                this.itemClassData       = this.itemClass       == undefined ? 'page' : this.itemClass;
                this.activePageClassData = this.activePageClass == undefined ? 'active-page' : this.activePageClass;

                if(this.currentPage > this.maxPage){
                    this.currentPageData = this.maxPage;
                }else{
                    this.currentPageData = this.currentPage;
                }
            },

            countEndPoints: function(): {first: number; last: number}{

                let 
                    first: number = 0,
                    last: number = 0;

                if(Number(this.currentPageData) + (this.pageSize / 2) >= this.maxPage){
                    last = this.maxPage;
                    first = this.maxPage - this.pageSize + 1;
                }else if(Number(this.currentPageData) - (this.pageSize / 2) <= 1){
                    first = 1;
                    last = this.pageSize;
                }else{
                    first = Math.ceil(Number(this.currentPageData) - this.pageSize / 2);
                    last = first + this.pageSize - 1;
                }

                if(last > this.maxPage){
                    last = this.maxPage;
                }

                if(first < 1){
                    first = 1;
                }

                return{
                    first: first,
                    last : last,
                }
            },

            createPages: function(first: number, last: number): Array<Page>{

                if(this.amountElements <= this.take){return [];}

                const pages: Array<Page> = [];

                for(let i = first; i <= last; i++){
                    const page: Page = {link: i, content: `${i}`, class: this.itemClassData};

                    if(i == this.currentPageData){
                        page.current = true;
                        page.class += ` ${this.activePageClassData}`;
                    }

                    pages.push(page);
                }

                return pages;
            },

            createStepPages: function(): {next: Page | undefined; prev: Page | undefined}{

                if(this.amountElements <= this.take){return {next: undefined, prev: undefined};}

                const
                    nextNum: number = (this.currentPageData + 1) > this.maxPage ? this.maxPage : this.currentPageData + 1,
                    prevNum: number = (this.currentPageData - 1) < 1            ? 1            : this.currentPageData - 1;

                return {
                    next: {link: nextNum, content: '>', class: this.itemClassData},
                    prev: {link: prevNum, content: '<', class: this.itemClassData},
                };
            },
            
            createEndPointsPages: function(): {last: Page | undefined; first: Page | undefined}{

                if(this.amountElements <= this.take){return {last: undefined, first: undefined};}

                return {
                    first: {link: 1,            content: 'First', class: this.itemClassData},
                    last : {link: this.maxPage, content: 'Last',  class: this.itemClassData},
                };
                
            },

            setCurrentPageEvt: function(e: any){
                const 
                    reg: RegExp     = /\d+/g,
                    newPage: number = Number(e.target.href.match(reg)[1]);

                this.currentPageData = newPage;
                this.render();
            },

            getCurrentPage: function(){
                return this.currentPageData;
            },

            getSkip: function(){
                return this.skip;
            }
        },
    });

</script>

<style lang="scss">
    .active-page{
        color: rgb(241, 129, 0);
    }
</style>
<template>
    <div class="page-user-edit">
        <Menu></Menu>

        <ActionBack ref="actionBackData" v-bind:headerMainText="`User with id: ${this.user.id}`" v-bind:headerAddText="`Edit`">
            <Form
                ref="dataForm"
                v-bind:rows="rowsEditForm"
                v-bind:action="'/user/edit'"
                v-bind:tableName="'user'"
                v-bind:className="'change-user-form'"
                v-bind:successCode="201"
                v-bind:overloadParseResult="true"
                v-on:result-parser="editFormResultParser"
            />
        </ActionBack>

        <ActionBack ref="actionBackPassword" v-bind:headerMainText="`User with id: ${this.user.id}`" v-bind:headerAddText="`Edit password`">
            <Form
                v-bind:rows="rowsPasswordForm"
                v-bind:action="'/user/edit-password'"
                v-bind:className="'change-password-form'"
                v-bind:successCode="201"
                v-bind:overloadParseResult="true"
                v-on:result-parser="passwordFormResultParser"
            />
        </ActionBack>

        <ActionBack ref="actionBackAvatar" v-bind:headerMainText="`User with id: ${this.user.id}`" v-bind:headerAddText="`Add avatar`">
            <form id="fileForm" ref="fileForm" >
                <span>Drop new image here</span>
            </form>
            <img :src="fileSrc" alt="">
            <progress :value="progressValue" max="100"></progress>
        </ActionBack>


        <div class="page-wrap">

            <div class="avatar-wrap">
                <h2>Avatar</h2>
                <div class="avatar" :style="{backgroundImage: 'url(' + require(`../../assets/user-avatar/${this.user.avatar}`)+ ')'}"></div>
                <button @click="editAvatarEvt" class="btn bth-avatar">Edit Avatar</button>
            </div>

            <div class="data-wrap">
                <h2>Data of user</h2>

                <table class="user-view">
                    <tr>
                        <td>Login</td>
                        <td>{{this.user.login}}</td>
                    </tr>
                    <tr>
                        <td>Surname</td>
                        <td>{{this.user.lastName}}</td>
                    </tr>
                    <tr>
                        <td>Name</td>
                        <td>{{this.user.firstName}}</td>
                    </tr>
                    <tr>
                        <td>E-mail</td>
                        <td>{{this.user.email}}</td>
                    </tr>
                </table>

                <button @click="editDataEvt" class="btn">Edit data</button>
            </div>

            <div class="notific-wrap">
                <h2>Notifications</h2>
            </div>

            <div class="add-btn-wrap">
                <button class="btn" @click="editPasswordEvt">Edit password</button>
                <button class="btn btn-error" @click="deleteUserEvt">Delete</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

    import {defineComponent} from 'vue';
    import Form, {FormItem}  from '../../components/Form.vue';
    import Menu              from '../../components/Menu.vue';
    import User              from "../../types/User";
    import ActionBack        from '../../components/ActionBack.vue';
    
    export default defineComponent({

        data: function(){
            return {
                user              : {} as User,
                capableDragAndDrop: false as boolean,
                fileSrc           : '',
                progressValue     : 0,

                rowsEditForm: [
                    [{type: 'text', name: 'login', label: 'Login'}, {type: 'hidden', name: 'id'}],
                    [{type: 'text', name: 'lastName', label: 'Surname', value: ''}],
                    [{type: 'text', name: 'firstName', label: 'Name'}],
                    [{type: 'submit', name: 'submit', value: 'Edit user'}],
                ] as Array<Array<FormItem>>,
                
                rowsPasswordForm: [
                    [{type: 'password', name: 'old'}, {type: 'password', name: 'new'}, {type: 'hidden', name: 'id'}],
                    [{type: 'submit', name: 'submit', value: 'Edit password'}],
                ] as Array<Array<FormItem>>,
            }
        },

        created: function(){
            this.user = this.$store.state.userIdentity!;

            this.rowsEditForm[0][1].value = this.user.id;
            this.rowsEditForm[0][0].value = this.user.login;
            this.rowsEditForm[1][0].value = this.user.lastName;
            this.rowsEditForm[2][0].value = this.user.firstName;

            this.rowsPasswordForm[0][2].value = this.user.id;
        },

        updated: function(){
            this.user = this.$store.state.userIdentity!;

            this.rowsEditForm[0][1].value = this.user.id;
            this.rowsEditForm[0][0].value = this.user.login;
            this.rowsEditForm[1][0].value = this.user.lastName;
            this.rowsEditForm[2][0].value = this.user.firstName;

            this.rowsPasswordForm[0][2].value = this.user.id;
        },

        //? this function are needed for init drag and drop prop
        mounted: async function(){
            this.capableDragAndDrop = this.determineCapableDragAndDrop();

            if(!this.capableDragAndDrop){
                this.$flashMessage.show({
                    type: 'error',
                    text: 'Your broswer can not works with drag and drop. Baaaad.',
                });
                return;
            }

            const events: Array<string> = [
                'drag', 
                'dragstart', 
                'dragend', 
                'dragover', 
                'dragenter', 
                'dragleave', 
                'drop'
            ];

            // events.forEach(function(e: string){
            //     this.$refs.fileForm.addEventListener(e, function(evt){
            //         evt.preventDefault();
            //         evt.stopPropagation();
            //     }.bind(this), false);
            // }.bind(this));

            // this.$refs.fileForm.addEventListener('drop', function(e){
            //     const 
            //         file: any = e.dataTransfer.files[0],
            //         deterFile: {'msg': string; success: boolean} = this.checkFile(file);

            //     if(!deterFile.success){
            //         this.$flashMessage.show({
            //             type: 'error',
            //             text: deterFile.msg,
            //         });
            //         return;
            //     }

            //     this.readFile(file);
            //     this.sendFile(file);

            // }.bind(this));
        },


        methods: {

            editDataEvt: function(e: any){
                const backComp = this.$refs.actionBackData! as any;
                backComp.show();
            },

            editPasswordEvt: function(e: any){
                const background = this.$refs.actionBackPassword! as any;
                background.show();
            },

            editAvatarEvt: function(e: any){
                const background = this.$refs.actionBackAvatar! as any;
                background.show();
            },

            //? for file Upload
            checkFile: function(file: any): {msg: string; success: boolean}{

                if(file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/jpg'){
                    return {msg: 'File is not a image!', success: false};
                }

                if(file.size > 8 * 1014 * 1024 * 8){
                    return {msg: 'Size of file more then 8mb', success: false};
                }

                return {msg: 'Good file', success: true};
            },

            //? for file Upload
            determineCapableDragAndDrop: function(){
                const div = document.createElement('div');

                return (('draggable' in div) || ('ondragstart' in div && 'ondrag' in div)) && 'FileReader' in window;
            },

            //? for file Upload
            readFile: function(file: any){
                const fr: FileReader = new FileReader();

                // fr.addEventListener('load', function(){
                //     this.fileSrc = fr.result;
                // }.bind(this), false);

                fr.readAsDataURL(file);
            },

            //? for file Upload
            sendFile: async function(file: any){
                const data: FormData = new FormData()
                data.append('file', file);
                // data.append('userId', this.$store.state.userIdentity!.id);

                const res = await this.$axios.post('user/edit-avatar', data, {
                    onUploadProgress: (e) => {
                        this.progressValue = Math.floor(e.loaded * 100 / e.total);
                    }
                });
                
                if(res.status == 400){
                    this.$flashMessage.show({
                        type: 'error',
                        text: res.data.error,
                    });
                    return;
                }

                if(res.status == 200){
                    this.$store.commit('setUserIdentity', res.data.user);

                    this.$flashMessage.show({
                        type: 'success',
                        text: res.data.msg,
                    });

                    console.log(this.$store.state.userIdentity);
                }

            },

            //* for edit User
            editFormResultParser: function(res: any){

                if(res.status == 400){
                    return;
                }
                
                this.$store.commit('setUserIdentity', res.data.user);
                this.user = res.data.user;

                console.log();
                
                this.$flashMessage.show({
                    type: 'success',
                    // image: require("../../assets/flashMessage/fail.svg"),
                    text: res.data.msg,
                });
            },

            passwordFormResultParser: function(res: any){

                if(res.status == 400){
                    return;
                }
                
                this.$store.commit('setUserIdentity', res.data.user);
                
                this.$flashMessage.show({
                    type: 'success',
                    // image: require("../../assets/flashMessage/fail.svg"),
                    text: res.data.msg,
                });

                console.log(res.data.user.password);
            }
        },

        components: {
            Form,
            Menu,
            ActionBack,
        }
    })
</script>


<style lang="scss">
    @import '../../assets/scss/pages/user/edit.scss';
</style>
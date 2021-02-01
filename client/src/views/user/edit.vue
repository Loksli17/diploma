<template>
    <div class="page-wrap">

        <div class="main-form-wrap">
            <Form
                v-bind:rows="rowsForm"
                v-bind:action="'/user/edit'"
                v-bind:tableName="'user'"
                v-bind:className="'change-user-form'"
                v-bind:successCode="201"
                v-bind:overloadParseResult="true"
                v-on:result-parser="formResultParser"
            />
        </div>

        <div class="avatar-wrap">
            <form id="fileForm" ref="fileForm" action="/user/editAvatar">
                <span>Drop new image here</span>
            </form>
            <img :src="fileSrc" alt="">
            <progress :value="progressValue" max="100"></progress>
        </div>

    </div>
</template>

<style lang="scss">

    .page-wrap{
        display: flex;
    }

    .avatar-wrap{
        max-width: 600px;
        margin-left: 40px;
    }

    #fileForm{

        span{
            display: block;
            border: 2px dashed #000;
            padding: 100px;
            margin: 30px 0px;
        }

        img{
            width: 100%
        }
    }

</style>


<script lang="ts">

    import {defineComponent} from 'vue';
    import Form, {FormItem}  from '../../components/Form.vue';
    
    export default defineComponent({

        data: function(){
            return {
                capableDragAndDrop: false as boolean,
                fileSrc: '',
                progressValue: 0,
                rowsForm: [
                    [{type: 'hidden', name: 'id'}],
                    [{type: 'text',   name: 'login',     label: 'Login'},],
                    [{type: 'text',   name: 'lastName',  label: 'Surname', value: ''}],
                    [{type: 'text',   name: 'firstName', label: 'Name'}],
                    [{type: 'submit', name: 'submit',    value: 'Edit user'}],
                ] as Array<Array<FormItem>>,
            }
        },

        created: function(){
            this.rowsForm[0][0].value = this.$store.state.userIdentity!.id;
            this.rowsForm[1][0].value = this.$store.state.userIdentity!.login;
            this.rowsForm[2][0].value = this.$store.state.userIdentity!.lastName;
            this.rowsForm[3][0].value = this.$store.state.userIdentity!.firstName;
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

            events.forEach(function(e){
                this.$refs.fileForm.addEventListener(e, function(evt){
                    evt.preventDefault();
                    evt.stopPropagation();
                }.bind(this), false);
            }.bind(this));

            this.$refs.fileForm.addEventListener('drop', function(e){
                const 
                    file: any = e.dataTransfer.files[0],
                    deterFile: {'msg': string; success: boolean} = this.checkFile(file);

                if(!deterFile.success){
                    this.$flashMessage.show({
                        type: 'error',
                        text: deterFile.msg,
                    });
                    return;
                }

                this.readFile(file);
                this.sendFile(file);

            }.bind(this));
        },


        methods: {

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

                fr.addEventListener('load', function(){
                    this.fileSrc = fr.result;
                }.bind(this), false);

                fr.readAsDataURL(file);
            },

            //? for file Upload
            sendFile: async function(file: any){
                const data: FormData = new FormData()
                data.append('file', file);
                data.append('userId', this.$store.state.userIdentity!.id);

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
            formResultParser: function(result: any){
                
                if(result.status == 400){
                    return;
                }
                
                this.$store.commit('setUserIdentity', result.data.user);
                
                this.$flashMessage.show({
                    type: 'success',
                    // image: require("../../assets/flashMessage/fail.svg"),
                    text: result.data.msg,
                });
            },
        },

        components: {
            Form,
        }
    })
</script>
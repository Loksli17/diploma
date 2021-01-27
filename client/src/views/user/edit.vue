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
            <form ref="fileform" action="/user/editAvatar">
                <span>Drop new image here</span>
            </form>
        </div>

    </div>
</template>


<script lang="ts">

    import {defineComponent} from 'vue';
    import Form, {FormItem}  from '../../components/Form.vue';
    import User              from '../../types/User';
    
    export default defineComponent({

        data: function(){
            return {
                rowsForm: [
                    [{type: 'hidden', name: 'id'}],
                    [{type: 'text',   name: 'login',     label: 'Login'},],
                    [{type: 'text',   name: 'lastName',  label: 'Surname', value: ''}],
                    [{type: 'text',   name: 'firstName', label: 'Name'}],
                    [{type: 'submit', name: 'submit',    value: 'Edit user'}],
                ] as Array<Array<FormItem>>,
            }
        },

        created: async function(){
            this.rowsForm[0][0].value = this.$store.state.userIdentity!.id;
            this.rowsForm[1][0].value = this.$store.state.userIdentity!.login;
            this.rowsForm[2][0].value = this.$store.state.userIdentity!.lastName;
            this.rowsForm[3][0].value = this.$store.state.userIdentity!.firstName;
        },

        methods: {
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
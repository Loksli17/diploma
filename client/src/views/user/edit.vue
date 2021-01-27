<template>
<Form
    v-bind:rows="rowsForm"
    v-bind:action="'/user/edit'"
    v-bind:tableName="'user'"
    v-bind:className="'change-user-form'"
    v-bind:successCode="201"
    v-bind:overloadParseResult="true"
    v-on:result-parser="formResultParser"
/>
</template>

<script lang="ts">
    import {defineComponent} from 'vue';
    import Form, {FormItem}  from '../../components/Form.vue';
    
    export default defineComponent({

        data: function(){
            return {
                rowsForm: [
                    [{type: 'hidden', name: 'id',        value: 1}],
                    [{type: 'text',   name: 'login',     label: 'Login'},],
                    [{type: 'email',  name: 'email',     label: 'E-mail'},],
                    [{type: 'text',   name: 'lastName',  label: 'Surname'}],
                    [{type: 'text',   name: 'firstName', label: 'Name'}],
                    [{type: 'submit', name: 'submit',    value: 'Edit user'}],
                ] as Array<Array<FormItem>>,
            }
        },

        created: function(){
            console.log(this.$store.state.userIdentity, this.$store.state.jwt);
            this.rowsForm[0][0].value = this.$store.state.userIdentity!.id;
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
import {mapGetters} from "vuex";


// const getJwt = {
//     ...mapGetters(['getJWT']),

//     jwt(): string{
//         return this.getJWT();
//     }
// }

export default {
    axiosPath: 'http://localhost:3000/',
    headers  : {
        'Content-Type': 'application/json',
        'JsonWebToken': `token`,

    },
}
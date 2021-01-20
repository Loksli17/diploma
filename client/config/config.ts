import axios from 'axios';

export default {
    axiosPath: 'http://localhost:3000/',
    headers  : {
        'Content-Type': 'application/json',
        // 'X-XSRF-TOKEN': axios.post('/csrf'),
    },
}
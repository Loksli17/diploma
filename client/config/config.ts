export default {
    port     : process.env.PORT || 8080,
    axiosPath: 'http://localhost:3000',
    headers  : {
        'Content-Type': 'application/json'
    },
}
export default{
    db: {
        name: 'onlineCorel',
        url : 'mongodb://localhost:27017/',
    },
    secret: {
        password: '~1;3JklN,<az09T',
        session : 'mtq[}$TyE4fg9)1',
        jwt     : '*7asd#$d^FjM!',
    },
    app: {
        port: 3000,
        name: 'onlineCorel',
        pagination: {
            pageSize: 5,
            limit   : 6,
        },
        timeLifeCookie: Date.now() + 1000 * 60 * 60 * 24,
    },
}
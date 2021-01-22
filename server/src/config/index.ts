export default{
    db: {
        name    : 'onlineCorel',
        user    : 'root',
        password: '1234',
        port    : 3306,
    },
    secret: {
        password: '~1;3JklN,<az09T',
        session : 'mtq[}$TyE4fg9)1',
        jwt     : '!jfGHkl324FgKekl0L23^fdg#$',
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
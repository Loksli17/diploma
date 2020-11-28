import mongoose from 'mongoose';
import config   from './index';

mongoose.connect(config.db.url, {
    useNewUrlParser   : true,
    useUnifiedTopology: true,
    dbName            : config.db.name, 
});

console.log('creation to db was successfuly');

export default mongoose;
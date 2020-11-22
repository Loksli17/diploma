import express, {Application, Request, Response, NextFunction} from 'express';

const app: express.Application = express();

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('My stiiiiiiicks');
});

app.listen(3000, () => console.log('Online corel was started. Stop it now?'));
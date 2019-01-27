import express from 'express';

import { SERVICE_NAME } from './configs/constants';
import moodController from './controllers/mood-controller';
import LogService from './services/log-service';

const port = process.env.PORT || 3000;

// Initialize the app.
const app = express();
app.set('storageMock', []);
app
  .use(LogService.middleware())
  .use(express.json())
  .use([`/api/${SERVICE_NAME}`], moodController)
  .listen(port, () => console.log(`App listening on port ${port}!`)); // eslint-disable-line no-console

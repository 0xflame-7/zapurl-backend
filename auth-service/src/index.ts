import express from 'express';
import { print } from '@zapurl/shared';

const app = express();
const PORT = process.env.PORT || 4000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server started at http://localhost:${PORT}/`);
  print();
});

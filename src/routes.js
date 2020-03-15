import { Router } from 'express';
import multer from 'multer';

import authMiddleware from './app/middlewares/auth';

import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import RecipientController from './app/controllers/RecipientController';
import CourierController from './app/controllers/CourierController';
import PackageController from './app/controllers/PackageController';
import DeliveryController from './app/controllers/DeliveryController';
import ProblemController from './app/controllers/ProblemController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.get('/couriers/:courier_id/deliveries', DeliveryController.index);
routes.put(
  '/couriers/:courier_id/deliveries/:package_id/start',
  DeliveryController.start
);
routes.put(
  '/couriers/:courier_id/deliveries/:package_id/end',
  DeliveryController.end
);

routes.post('/deliveries/:id/problems', ProblemController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.use(authMiddleware);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.get('/couriers/:id', CourierController.show);
routes.put('/couriers/:id', CourierController.update);
routes.delete('/couriers/:id', CourierController.delete);

routes.get('/packages', PackageController.index);
routes.post('/packages', PackageController.store);
routes.get('/packages/:id', PackageController.show);
routes.put('/packages/:id', PackageController.update);
routes.delete('/packages/:id', PackageController.delete);

routes.get('/deliveries/:id/problems', ProblemController.index);
routes.delete('/problems/:id/cancel-delivery', ProblemController.delete);

export default routes;

import * as Yup from 'yup';
import { Op } from 'sequelize';
import { parseISO, startOfDay, endOfDay } from 'date-fns';
import Delivery from '../models/Delivery';
import File from '../models/File';

class DeliveryStatusController {
  async index(req, res) {
    const { id: deliveryman_id } = req.params;

    if (!deliveryman_id) {
      return res.status(401).json('Deliveryman does not exist.');
    }

    const { page = 1, limit = 10, delivered = false } = req.query;

    const deliverymen = await Delivery.findAll({
      where: {
        deliveryman_id,
        canceled_at: null,
        end_date: delivered
          ? {
              [Op.ne]: null,
            }
          : null,
      },
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'desc']],
    });
    return res.json(deliverymen);
  }

  async start(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails.' });
    }
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(401).json('Delivery does not exist.');
    }

    if (delivery.end_date) {
      return res.status(401).json('Delivery already started.');
    }

    const { deliveryman_id } = delivery;
    const { start_date } = req.body;
    const parsedDate = parseISO(start_date);

    const { count: countDailyDeliveries } = await Delivery.findAndCountAll({
      where: {
        deliveryman_id,
        start_date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
    });

    if (countDailyDeliveries === 5) {
      return res
        .status(401)
        .json({ error: 'You have reached your daily delivery limit.' });
    }

    await delivery.update({
      start_date: delivery.start_date || start_date,
    });

    return res.json(delivery);
  }

  async end(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails.' });
    }

    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(401).json('Delivery does not exist.');
    }

    if (delivery.end_date) {
      return res.status(401).json('Delivery already finished.');
    }

    const { end_date, signature_id } = req.body;

    if (signature_id) {
      const signature = await File.findByPk(signature_id);
      if (!signature) {
        return res.status(401).json('Signature does not exist.');
      }
    }

    await delivery.update({
      end_date,
      signature_id,
    });

    return res.json(delivery);
  }
}

export default new DeliveryStatusController();

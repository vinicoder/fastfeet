import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class DeliveryController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const delivery = await Delivery.findAll({
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'desc']],
    });
    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({
        error: 'Validation fails.',
      });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const checkRecipient = await Recipient.findByPk(recipient_id);
    if (!checkRecipient) {
      return res.status(401).json({ error: 'Recipient does not exist.' });
    }

    const checkDeliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!checkDeliveryman) {
      return res.status(401).json({ error: 'Deliveryman does not exist.' });
    }

    const { id } = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
      canceled_at: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({
        error: 'Validation fails.',
      });
    }

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist.' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const checkRecipient = await Recipient.findByPk(recipient_id);
    if (!checkRecipient) {
      return res.status(401).json({ error: 'Recipient does not exist.' });
    }

    const checkDeliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!checkDeliveryman) {
      return res.status(401).json({ error: 'Deliveryman does not exist.' });
    }

    const { id } = await delivery.update({
      recipient_id,
      deliveryman_id,
      product,
    });

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
    });
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist' });
    }

    delivery.destroy();

    return res.json();
  }
}

export default new DeliveryController();

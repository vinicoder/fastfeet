import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const deliveryProblems = await DeliveryProblem.findAll({
      where: {
        delivery_id: req.params.id,
      },
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'desc']],
      include: {
        model: Delivery,
        as: 'delivery',
        attributes: ['product', 'start_date', 'end_date', 'canceled_at'],
        include: {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
      },
    });
    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({
        error: 'Validation fails.',
      });
    }

    const { id: delivery_id } = req.params;

    const delivery = await Delivery.findByPk(delivery_id);
    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist.' });
    }

    const { description } = req.body;

    const problem = await DeliveryProblem.create({
      delivery_id,
      description,
    });

    return res.json(problem);
  }

  async cancelDelivery(req, res) {
    const { delivery_id } = await DeliveryProblem.findByPk(req.params.id);
    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exist' });
    }

    await delivery.update({
      canceled_at: new Date(),
    });

    return res.json();
  }
}

export default new DeliveryProblemController();

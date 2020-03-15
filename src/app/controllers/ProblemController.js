import * as Yup from 'yup';
import Problem from '../models/Problem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class ProblemController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const problems = await Problem.findAll({
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
    return res.json(problems);
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

    const problem = await Problem.create({
      delivery_id,
      description,
    });

    return res.json(problem);
  }

  async delete(req, res) {
    const { delivery_id } = await Problem.findByPk(req.params.id);
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

export default new ProblemController();

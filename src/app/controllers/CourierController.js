import * as Yup from 'yup';
import Courier from '../models/Courier';

class CourierController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const couriers = await Courier.findAll({
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'desc']],
    });
    return res.json(couriers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails.' });
    }

    const courierExists = await Courier.findOne({
      where: { email: req.body.email },
    });

    if (courierExists) {
      return res.status(401).json({ error: 'Courier already exists.' });
    }

    const { id, name, email } = await Courier.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails.' });
    }

    const courier = await Courier.findByPk(req.params.id);

    if (!courier) {
      return res.status(401).json({ error: 'Courier does not exist.' });
    }

    const { email } = req.body;
    if (email && email !== Courier.email) {
      const courierExists = await Courier.findOne({
        where: { email },
      });

      if (courierExists) {
        return res.status(401).json({ error: 'Courier already exists.' });
      }
    }

    const { id, name } = await Courier.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async delete(req, res) {
    const courier = await Courier.findByPk(req.params.id);

    if (!courier) {
      return res.status(401).json({ error: 'Courier does not exist' });
    }

    Courier.destroy();

    return res.json();
  }
}

export default new CourierController();

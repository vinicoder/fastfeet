import * as Yup from 'yup';
import Package from '../models/Package';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';

class PackageController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const packages = await Package.findAll({
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'desc']],
    });
    return res.json(packages);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      courier_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({
        error: 'Validation fails.',
      });
    }

    const { recipient_id, courier_id, product } = req.body;

    const checkRecipient = await Recipient.findByPk(recipient_id);
    if (!checkRecipient) {
      return res.status(401).json({ error: 'Recipient does not exist.' });
    }

    const checkCourier = await Courier.findByPk(courier_id);
    if (!checkCourier) {
      return res.status(401).json({ error: 'Courier does not exist.' });
    }

    const { id } = await Package.create({
      recipient_id,
      courier_id,
      product,
    });

    return res.json({
      id,
      recipient_id,
      courier_id,
      product,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      courier_id: Yup.number(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({
        error: 'Validation fails.',
      });
    }

    const packages = await Package.findByPk(req.params.id);

    if (!packages) {
      return res.status(401).json({ error: 'Package does not exist.' });
    }

    const { recipient_id, courier_id, product } = req.body;

    const checkRecipient = await Recipient.findByPk(recipient_id);
    if (!checkRecipient) {
      return res.status(401).json({ error: 'Recipient does not exist.' });
    }

    const checkCourier = await Courier.findByPk(courier_id);
    if (!checkCourier) {
      return res.status(401).json({ error: 'Courier does not exist.' });
    }

    const { id } = await packages.update({
      recipient_id,
      courier_id,
      product,
    });

    return res.json({
      id,
      recipient_id,
      courier_id,
      product,
    });
  }

  async delete(req, res) {
    const packages = await Package.findByPk(req.params.id);

    if (!packages) {
      return res.status(401).json({ error: 'Package does not exist' });
    }

    await packages.update({
      canceled_at: new Date(),
    });

    return res.json();
  }
}

export default new PackageController();

import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      cep: Yup.number()
        .required()
        .min(8),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({
        error: 'Validation fails.',
      });
    }

    const recipient = await Recipient.create(req.body);

    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      cep: Yup.number().min(8),
      street: Yup.string(),
      number: Yup.number(),
      complement: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({
        error: 'Validation fails.',
      });
    }

    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient does not exist' });
    }

    await recipient.update(req.body);

    return res.json(recipient);
  }

  async delete(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient does not exist' });
    }

    recipient.destroy();

    return res.json();
  }
}

export default new RecipientController();

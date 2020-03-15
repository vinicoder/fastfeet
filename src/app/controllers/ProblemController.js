import * as Yup from 'yup';
import Problem from '../models/Problem';
import Package from '../models/Package';
import Courier from '../models/Courier';

class ProblemController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const problems = await Problem.findAll({
      where: {
        package_id: req.params.id,
      },
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'desc']],
      include: {
        model: Package,
        as: 'package',
        attributes: ['product', 'start_date', 'end_date', 'canceled_at'],
        include: {
          model: Courier,
          as: 'courier',
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

    const { id: package_id } = req.params;

    const packages = await Package.findByPk(package_id);
    if (!packages) {
      return res.status(401).json({ error: 'Package does not exist.' });
    }

    const { description } = req.body;

    const problem = await Problem.create({
      package_id,
      description,
    });

    return res.json(problem);
  }

  async delete(req, res) {
    const { package_id } = await Problem.findByPk(req.params.id);
    const packages = await Package.findByPk(package_id);

    if (!packages) {
      return res.status(401).json({ error: 'Package does not exist' });
    }

    await packages.update({
      canceled_at: new Date(),
    });

    return res.json();
  }
}

export default new ProblemController();

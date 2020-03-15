import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  parseISO,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  isBefore,
  isAfter,
} from 'date-fns';
import Package from '../models/Package';
import File from '../models/File';
import Courier from '../models/Courier';

class DeliveryController {
  async index(req, res) {
    const { courier_id } = req.params;

    if (!courier_id) {
      return res.status(401).json({ error: 'Courier does not exist.' });
    }

    const { page = 1, limit = 10, delivered = false } = req.query;

    const packages = await Package.findAll({
      where: {
        courier_id,
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
    return res.json(packages);
  }

  async start(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails.' });
    }

    const { courier_id, package_id } = req.params;

    const packages = await Package.findByPk(package_id);
    if (!packages) {
      return res.status(401).json({ error: 'Packages does not exist.' });
    }

    // if (packages.start_date) {
    //   return res.status(401).json({ error: 'Packages already started.' });
    // }

    const courier = await Courier.findByPk(courier_id);
    if (!courier) {
      return res.status(401).json({ error: 'Courier does not exist.' });
    }

    if (packages.courier_id !== parseInt(courier_id, 10)) {
      return res.status(401).json({ error: 'You dont have permission.' });
    }

    const { start_date } = req.body;
    const parsedDate = parseISO(start_date);

    const { count: countDailyDeliveries } = await Package.findAndCountAll({
      where: {
        courier_id,
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

    const hourMin = setSeconds(setMinutes(setHours(parsedDate, 8), 0), 0);
    const hourMax = setSeconds(setMinutes(setHours(parsedDate, 18), 0), 0);
    if (isBefore(parsedDate, hourMin) || isAfter(parsedDate, hourMax)) {
      return res
        .status(401)
        .json({ error: 'Pickup only from 8:00 am to 6:00 pm.' });
    }

    await packages.update({
      start_date,
    });

    return res.json(packages);
  }

  async end(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails.' });
    }

    const { courier_id, package_id } = req.params;

    const packages = await Package.findByPk(package_id);
    if (!packages) {
      return res.status(401).json({ error: 'Package does not exist.' });
    }

    if (packages.end_date) {
      return res.status(401).json({ error: 'Package already finished.' });
    }

    if (!packages.start_date) {
      return res.status(401).json({ error: 'Package is not started.' });
    }

    const courier = await Courier.findByPk(courier_id);
    if (!courier) {
      return res.status(401).json({ error: 'Courier does not exist.' });
    }

    if (packages.courier_id !== parseInt(courier_id, 10)) {
      return res.status(401).json({ error: 'You dont have permission.' });
    }

    const { end_date, signature_id } = req.body;

    if (signature_id) {
      const signature = await File.findByPk(signature_id);
      if (!signature) {
        return res.status(401).json('Signature file does not exist.');
      }
    }

    await packages.update({
      end_date,
      signature_id,
    });

    return res.json(packages);
  }
}

export default new DeliveryController();

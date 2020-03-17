import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { problem } = data;

    await Mail.sendMail({
      to: `${problem.package.courier.name} <${problem.package.courier.email}>`,
      subject: 'Encomenda cancelada',
      template: 'cancellation',
      context: {
        date: format(
          parseISO(problem.package.canceled_at),
          "dd 'de' MMMM', às' H:mm'h'",
          {
            locale: ptBR,
          }
        ),
        product: problem.package.product,
        courier: problem.package.courier,
        recipient: problem.package.recipient,
      },
    });
  }
}
export default new CancellationMail();

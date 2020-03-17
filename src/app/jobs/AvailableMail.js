import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Mail from '../../lib/Mail';

class AvailableMail {
  get key() {
    return 'AvailableMail';
  }

  async handle({ data }) {
    const { packages } = data;

    await Mail.sendMail({
      to: `${packages.courier.name} <${packages.courier.email}>`,
      subject: 'Encomenda disponível para retirada',
      template: 'available',
      context: {
        date: format(
          parseISO(packages.createdAt),
          "dd 'de' MMMM', às' H:mm'h'",
          {
            locale: ptBR,
          }
        ),
        product: packages.product,
        courier: packages.courier,
        recipient: packages.recipient,
      },
    });
  }
}
export default new AvailableMail();

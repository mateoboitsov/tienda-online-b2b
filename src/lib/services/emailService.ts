import nodemailer from 'nodemailer';

const NOTIFY_EMAILS = ['boitsov01@gmail.com', 'info@versaltechb2b.com'];
const NOTIFY_EMAIL_STRING = NOTIFY_EMAILS.join(', ');
const CUSTOMER_FROM = '"Versaltech B2B" <info@versaltechb2b.com>';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ─── Nuevo Contacto ──────────────────────────────────────────────
export async function sendContactNotification(data: {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  selectedBrands: string[];
  selectedModels: string[];
  selectedConditions: string[];
  message?: string;
}) {
  await transporter.sendMail({
    from: `"Versaltech B2B" <${process.env.GMAIL_USER}>`,
    to: NOTIFY_EMAIL_STRING,
    subject: `Nuevo contacto: ${data.fullName} (${data.companyName})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 12px;">Nuevo Contacto desde la Web</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Nombre:</td><td style="padding: 8px;">${data.fullName}</td></tr>
          <tr style="background:#f0f0f0"><td style="padding: 8px; font-weight: bold; color: #555;">Empresa:</td><td style="padding: 8px;">${data.companyName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr style="background:#f0f0f0"><td style="padding: 8px; font-weight: bold; color: #555;">Telefono:</td><td style="padding: 8px;">${data.phone || '-'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Marcas:</td><td style="padding: 8px;">${data.selectedBrands.join(', ') || '-'}</td></tr>
          <tr style="background:#f0f0f0"><td style="padding: 8px; font-weight: bold; color: #555;">Modelos:</td><td style="padding: 8px;">${data.selectedModels.join(', ') || '-'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Estado:</td><td style="padding: 8px;">${data.selectedConditions.join(', ') || '-'}</td></tr>
          ${data.message ? `<tr style="background:#f0f0f0"><td style="padding: 8px; font-weight: bold; color: #555;">Mensaje:</td><td style="padding: 8px;">${data.message}</td></tr>` : ''}
        </table>

        <p style="margin-top: 20px; color: #888; font-size: 12px;">Enviado desde versaltechb2b.com · ${new Date().toLocaleString('es-ES')}</p>
      </div>
    `,
  });
}

// ─── Nuevo Pedido ────────────────────────────────────────────────
export async function sendOrderNotification(data: {
  orderNumber: string;
  userName: string;
  userEmail: string;
  company: string;
  totalAmount: number;
  shippingCountry: string;
  paymentMethod: string;
}) {
  await transporter.sendMail({
    from: `"Versaltech B2B" <${process.env.GMAIL_USER}>`,
    to: NOTIFY_EMAIL_STRING,
    subject: `Nuevo pedido #${data.orderNumber} - ${data.company}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 12px;">Nuevo Pedido B2B</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Pedido:</td><td style="padding: 8px; font-size: 18px; font-weight: bold; color: #2563eb;">${data.orderNumber}</td></tr>
          <tr style="background:#f0f0f0"><td style="padding: 8px; font-weight: bold; color: #555;">Cliente:</td><td style="padding: 8px;">${data.userName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Empresa:</td><td style="padding: 8px;">${data.company}</td></tr>
          <tr style="background:#f0f0f0"><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;"><a href="mailto:${data.userEmail}">${data.userEmail}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Total:</td><td style="padding: 8px; font-size: 16px; font-weight: bold; color: #16a34a;">€${data.totalAmount.toFixed(2)}</td></tr>
          <tr style="background:#f0f0f0"><td style="padding: 8px; font-weight: bold; color: #555;">Pais de envio:</td><td style="padding: 8px;">${data.shippingCountry}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Metodo de pago:</td><td style="padding: 8px;">${data.paymentMethod}</td></tr>
        </table>

        <p style="margin-top: 20px; color: #888; font-size: 12px;">Enviado desde versaltechb2b.com · ${new Date().toLocaleString('es-ES')}</p>
      </div>
    `,
  });
}

// ─── Nuevo Registro ──────────────────────────────────────────────
export async function sendRegistrationNotification(data: {
  name: string;
  email: string;
  company: string;
  country: string;
  phone?: string;
}) {
  await transporter.sendMail({
    from: `"Versaltech B2B" <${process.env.GMAIL_USER}>`,
    to: NOTIFY_EMAIL_STRING,
    subject: `Nuevo registro: ${data.company} (${data.name})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 12px;">Nuevo Registro B2B - Pendiente de Aprobacion</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Nombre:</td><td style="padding: 8px;">${data.name}</td></tr>
          <tr style="background:#f0f0f0"><td style="padding: 8px; font-weight: bold; color: #555;">Empresa:</td><td style="padding: 8px;">${data.company}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr style="background:#f0f0f0"><td style="padding: 8px; font-weight: bold; color: #555;">Pais:</td><td style="padding: 8px;">${data.country}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #555;">Telefono:</td><td style="padding: 8px;">${data.phone || '-'}</td></tr>
        </table>

        <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">Este usuario esta pendiente de aprobacion. Ve al panel de administracion para aprobarle.</p>
        </div>

        <p style="margin-top: 20px; color: #888; font-size: 12px;">Enviado desde versaltechb2b.com · ${new Date().toLocaleString('es-ES')}</p>
      </div>
    `,
  });
}

/**
 * Envia una notificacion al usuario cuando su cuenta ha sido aprobada.
 */
export async function sendApprovalNotification(data: {
  name: string;
  email: string;
}) {
  await transporter.sendMail({
    from: CUSTOMER_FROM,
    to: data.email,
    subject: "¡Tu cuenta de VersalTech B2B ha sido aprobada!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 16px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #000;">¡Bienvenido a VersalTech B2B, ${data.name}!</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 32px;">
          Nos complace informarte de que tu cuenta ha sido aprobada. Ya tienes acceso completo a nuestro catálogo exclusivo y puedes empezar a realizar tus pedidos.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="https://versaltechb2b.com/login" 
             style="background: #000000; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
            Acceder a la tienda
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

        <p style="font-size: 14px; color: #9ca3af; text-align: center;">
          Si tienes alguna pregunta, no dudes en contactar con nosotros a través de WhatsApp o respondiendo a este email.
        </p>
        
        <p style="font-size: 12px; color: #d1d5db; text-align: center; margin-top: 24px;">
          versaltechb2b.com
        </p>
      </div>
    `,
  });
}

// ─── Confirmacion de Pedido para el Cliente ────────────────────────
export async function sendCustomerOrderConfirmation(data: {
  orderNumber: string;
  name: string;
  email: string;
  totalAmount: number;
  shippingCost: number;
  shippingSpeed: string;
  shippingCountry: string;
  paymentMethod: string;
  shippingAddress: {
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    storage?: string;
    color?: string;
    condition?: string;
  }>;
}) {
  const WHATSAPP_NUMBER = '351928399390';
  const WHATSAPP_MESSAGE = encodeURIComponent(
    `Hola, acabo de realizar el pedido #${data.orderNumber} y me gustaría recibir los datos para la transferencia.`
  );

  const shippingLabel = data.shippingSpeed === 'express' || data.shippingSpeed === 'urgent'
    ? 'Envío urgente (24-72h)'
    : data.shippingSpeed === 'saturday'
      ? 'Envío en sábado'
      : 'Envío estándar (2-5 días)';

  const shippingCostLabel = data.shippingCost === 0 ? 'A consultar' : `€${data.shippingCost.toFixed(2)}`;
  const subtotal = data.totalAmount - data.shippingCost;

  const itemsRows = data.items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
        <div style="font-weight: 600; color: #111;">${item.name}</div>
        <div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">
          ${[item.storage, item.color, item.condition ? `Grado ${item.condition}` : ''].filter(Boolean).join(' · ')}
        </div>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: center; color: #6b7280;">x${item.quantity}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #111;">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: CUSTOMER_FROM,
    to: data.email,
    subject: `Confirmación de pedido #${data.orderNumber} - VersalTech B2B`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 16px;">
        
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 4px; color: #000;">¡Gracias por tu pedido, ${data.name}!</h2>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 32px;">Pedido <strong>#${data.orderNumber}</strong> · Estado: <strong>Pendiente de pago</strong></p>

        <!-- Productos -->
        <div style="margin-bottom: 28px;">
          <p style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Productos</p>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsRows}
            <tr>
              <td colspan="2" style="padding: 10px 0; font-size: 13px; color: #6b7280;">Subtotal</td>
              <td style="padding: 10px 0; text-align: right; font-size: 13px; color: #6b7280;">€${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 6px 0; font-size: 13px; color: #6b7280;">${shippingLabel}</td>
              <td style="padding: 6px 0; text-align: right; font-size: 13px; color: #6b7280;">${shippingCostLabel}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 12px 0; font-size: 16px; font-weight: 700; color: #000; border-top: 2px solid #e5e7eb;">Total</td>
              <td style="padding: 12px 0; text-align: right; font-size: 16px; font-weight: 700; color: #000; border-top: 2px solid #e5e7eb;">€${data.totalAmount.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Direccion de envio -->
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <p style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">Direccion de envio</p>
          <p style="margin: 0; line-height: 1.7; color: #374151; font-size: 14px;">
            ${data.shippingAddress.address}<br/>
            ${data.shippingAddress.city}, ${data.shippingAddress.postal_code}<br/>
            ${data.shippingAddress.country}
            ${data.shippingAddress.phone ? `<br/><span style="color: #9ca3af;">Tel: ${data.shippingAddress.phone}</span>` : ''}
          </p>
        </div>

        <!-- Siguientes pasos -->
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 28px;">
          <p style="font-size: 13px; font-weight: 700; color: #15803d; margin: 0 0 6px;">Siguientes pasos</p>
          <p style="font-size: 13px; color: #166534; margin: 0; line-height: 1.6;">
            Nuestro equipo se pondrá en contacto contigo para enviarte los <strong>datos de la transferencia bancaria</strong>. Te notificaremos por email cuando cambie el estado de tu pedido.
          </p>
        </div>

        <!-- WhatsApp CTA -->
        <div style="text-align: center; margin-bottom: 32px;">
          <p style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">¿Quieres acelerar el proceso?</p>
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}" 
             style="background: #25d366; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
            Contactar por WhatsApp
          </a>
        </div>

        <p style="font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 8px;">
          versaltechb2b.com
        </p>
      </div>
    `,
  });
}

// ─── Actualizacion de Estado de Pedido ────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente de pago',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#16a34a',
  cancelled: '#ef4444',
};

export async function sendOrderStatusUpdate(data: {
  orderNumber: string;
  name: string;
  email: string;
  newStatus: string;
  totalAmount: number;
}) {
  const label = STATUS_LABELS[data.newStatus] || data.newStatus;
  const color = STATUS_COLORS[data.newStatus] || '#6b7280';

  const statusMessages: Record<string, string> = {
    processing: 'Estamos preparando tu pedido. En breve recibirás más información.',
    shipped: '¡Tu pedido está en camino! Pronto recibirás los detalles de seguimiento.',
    delivered: '¡Tu pedido ha sido entregado! Esperamos que estés satisfecho.',
    cancelled: 'Tu pedido ha sido cancelado. Contacta con nosotros si tienes alguna pregunta.',
  };

  const statusMessage = statusMessages[data.newStatus] || 'El estado de tu pedido ha sido actualizado.';

  await transporter.sendMail({
    from: CUSTOMER_FROM,
    to: data.email,
    subject: `Pedido #${data.orderNumber}: ${label}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 16px;">

        <div style="text-align: center; margin-bottom: 32px;">
          <span style="display: inline-block; background: ${color}20; color: ${color}; padding: 8px 20px; border-radius: 999px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; border: 1px solid ${color}40;">
            ${label}
          </span>
        </div>

        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #000; text-align: center;">Pedido #${data.orderNumber}</h2>
        
        <p style="font-size: 15px; line-height: 1.7; color: #4b5563; margin-bottom: 32px; text-align: center;">
          Hola ${data.name}, ${statusMessage}
        </p>

        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 32px;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px;">Total del pedido</p>
          <p style="font-size: 24px; font-weight: 700; color: #000; margin: 0;">€${data.totalAmount.toFixed(2)}</p>
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="https://versaltechb2b.com/login"
             style="background: #000; color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
            Ver mis pedidos
          </a>
        </div>

        <p style="font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px;">
          versaltechb2b.com
        </p>
      </div>
    `,
  });
}

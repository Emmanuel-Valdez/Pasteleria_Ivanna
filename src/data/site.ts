export const site = {
  name: 'Pastelería Ivanna',
  slogan: 'Cuando hay festejo, hay torta',
  whatsappNumber: '5492616650028',
  phoneDisplay: '261 665-0028',
};

export function whatsappHref(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

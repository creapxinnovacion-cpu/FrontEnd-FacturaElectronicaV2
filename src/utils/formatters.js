export const formatCurrency = value =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export const formatDate = date =>
  new Date(date).toLocaleDateString('es-SV');

export function prepareWeightToServer(weight: number, units: 'kg' | 'gr') {
  switch (units) {
    case 'kg':
      return weight;
    case 'gr':
      return weight / 1000;

    default:
      return weight;
  }
}

export function prepareWeightToForm(weight: number, units: 'kg' | 'gr') {
  switch (units) {
    case 'kg':
      return weight;
    case 'gr':
      return weight * 1000;

    default:
      return weight;
  }
}

export function preparePriceToServer(price: number, units: 'kg' | 'gr') {
  switch (units) {
    case 'kg':
      return price;
    case 'gr':
      return price * 1000;

    default:
      return price;
  }
}

export function preparePriceToForm(price: number, units: 'kg' | 'gr') {
  switch (units) {
    case 'kg':
      return price;
    case 'gr':
      return price / 1000;

    default:
      return price;
  }
}
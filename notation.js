function f(num, digits = 0) {
  if (digits > 0) num = D(num).mul(Math.pow(10,digits)).floor().div(Math.pow(10,digits));
  else num = D(num).floor();
  return N['sci'](num);
}

let N = {};

N.sci = function(num) {
  if (num.lt(1e6)) return num.toString();
  if (num.lt('ee6')) return Math.pow(10, num.log10().toNumber() % 1).toFixed(2).replace(/([0-9]+(.[0-9]+[1-9])?)(.?0+$)/, '$1') + 'e' + num.log10().floor().toString();
  if (num.lt('10^^8')) return 'e' + f(num.log10());
  if (num.lt('10^^^4')) return '10^^' + f(num.slog(), 1);
  return num.toString().replace(/\.\d+/, '');
}
// !arithmepad-properties {"title":"Binomial Model"}
// !arithmepad-cell
u = 1.2;
d = 0.8;
r = 0.01;
S0 = 100;
K = 120;
T = 10;
ns = _.range(T+1);
// !arithmepad-cell
fac = function(n) {
  var res = 1;
  for (var i=2; i<=n; i++)
    res *= i;
  return res;
};
choose = (n, k) => fac(n) / (fac(k) * fac(n-k));
// !arithmepad-cell
S = (t, n) => S0 * Math.pow(u, n) * Math.pow(d, t-n);

new Chartist.Line(plotId, {
  labels: ns,
  series: [_(ns).map(n => S(T, n))]
});
// !arithmepad-cell
q = (1 + r - d) / (u - d);
Q = (t, n) => choose(t, n) * Math.pow(q, n) * Math.pow(q, t-n);

new Chartist.Bar(plotId, {
  labels: _(ns).map(n => Math.round(S(T, n))),
  series: [_(ns).map(n => ({x: S(T, n), y: Q(T, n)}))]
}, {axisX: {type: Chartist.AutoScaleAxis}});
// !arithmepad-cell
payoff = (s) => Math.max(s, K);

data = {labels: ns, series: [_(ns).map(n => payoff(S(T, n)))]};
new Chartist.Line(plotId, {
  labels: _(ns).map(n => Math.round(S(T, n))),
  series: [_(ns).map(n => ({x: S(T, n), y: payoff(S(T, n))}))]
}, {axisX: {type: Chartist.AutoScaleAxis}});
// !arithmepad-cell
var last_values = [S0];
series = [];
for (var t=0; t<=T; t++) {
  new_values = [];
  for (var n=0; n<last_values.length; n++) {
    new_values.push(last_values[n]*u);
    series.push([{x: t, y: last_values[n]}, {x: t+1, y: last_values[n]*u}]);
    series.push([{x: t, y: last_values[n]}, {x: t+1, y: last_values[n]*d}]);
  }
  new_values.push(last_values[n-1]*d);
  last_values = new_values;
}
new Chartist.Line(plotId, {
  labels: ns,
  series: series
}, {axisX: {type: Chartist.AutoScaleAxis}});
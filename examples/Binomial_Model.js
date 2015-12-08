// !arithmepad-properties {"title":"Binomial Model"}
// !arithmepad-cell
u = 1.2
d = 0.8
r = 0.01
S0 = 100
K = 100
T = 10
ns = _.range(T+1)
// !arithmepad-cell
fac = function(n) {
  var res = 1;
  for (var i=2; i<=n; i++)
    res *= i;
  return res;
}
choose = (n, k) => fac(n) / (fac(k) * fac(n-k))

// !arithmepad-cell
S = (t, n) => S0 * Math.pow(u, n) * Math.pow(d, t-n)

data = {labels: ns, series: [_(ns).map(n => S(T, n))]};
new Chartist.Line(plotId, data);
// !arithmepad-cell
q = (1 + r - d) / (u - d)
Q = (t, n) => choose(t, n) * Math.pow(q, n) * Math.pow(q, t-n)

new Chartist.Bar(plotId, {
  labels: _(ns).map(n => Math.round(S(T, n))),
  series: [_(ns).map(n => ({x: S(T, n), y: Q(T, n)}))]
});
// !arithmepad-cell
payoff = (s) => Math.max(s, K)

data = {labels: ns, series: [_(ns).map(n => payoff(S(T, n)))]};
new Chartist.Line(plotId, {
  labels: _(ns).map(n => Math.round(S(T, n))),
  series: [_(ns).map(n => ({x: S(T, n), y: payoff(S(T, n))}))]
});
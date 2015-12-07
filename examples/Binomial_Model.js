// !arithmepad-properties {"title":"Binomial Model"}
// !arithmepad-cell
u = 1.2
d = 0.8
r = 0.01
T = 10
// !arithmepad-cell
fac = function(n) {
  var res = 1;
  for (var i=2; i<=n; i++)
    res *= i;
  return res;
}
choose = (n, k) => fac(n) / (fac(k) * fac(n-k))

// !arithmepad-cell
q = (1 + r - d) / (u - d)
Q = (t, n) => choose(t, n) * Math.pow(q, n) * Math.pow(q, t-n)

ns = _.range(T+1)
data = {labels: ns, series: [_(ns).map(n => Q(T, n))]};

new Chartist.Bar(plotId, data);

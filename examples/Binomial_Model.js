// !arithmepad-properties {"title":"Binomial Model"}
// !arithmepad-cell {"cellType":"markdown","showLineNumbers":false}
// # The Binomial Model
// !arithmepad-cell {"cellType":"markdown","showLineNumbers":false}
// Setting up some parameters.
// !arithmepad-cell {"cellType":"js","showLineNumbers":true}
u = 1.2;
d = 0.8;
r = 0.01;
S0 = 100;
K = 120;
T = 10;
ns = _.range(T+1);
// !arithmepad-cell {"cellType":"js","showLineNumbers":true}
fac = function(n) {
  var res = 1;
  for (var i=2; i<=n; i++)
    res *= i;
  return res;
};
choose = (n, k) => fac(n) / (fac(k) * fac(n-k));
// !arithmepad-cell {"cellType":"js","showLineNumbers":false}
// set up tree
nEntries = (T+1)*(T+2)/2
tree = {
  S: new Float64Array(nEntries),
  Q: new Float64Array(nEntries),
};
idx = function(t, n) {
  if (n > t) {
    throw ('n=' + n + ' > ' + t + '=t: n cannot be larger than t!');
  }
  return (t+1)*t/2+n;
};
for (var t=0; t<=T; t++) {
  for (var n=0; n<=t; n++) {
    tree.S[idx(t,n)] = S0 * Math.pow(u, n) * Math.pow(d, t-n);
    tree.Q[idx(t,n)] = choose(t, n) * Math.pow(q, n) * Math.pow(q, t-n);
  }
}
nEntries
// !arithmepad-cell {"cellType":"js","showLineNumbers":true}
S = (t, n) => tree.S[idx(t, n)];//S0 * Math.pow(u, n) * Math.pow(d, t-n);

new Chartist.Line(plotId, {
  labels: ns,
  series: [_(ns).map(n => S(T, n))]
}, {height: 300});
// !arithmepad-cell {"cellType":"js","showLineNumbers":true}
q = (1 + r - d) / (u - d);
Q = (t, n) => tree.Q[idx(t, n)];//choose(t, n) * Math.pow(q, n) * Math.pow(q, t-n);

new Chartist.Bar(plotId, {
  labels: _(ns).map(n => Math.round(S(T, n))),
  series: [_(ns).map(n => ({x: S(T, n), y: Q(T, n)}))]
}, {
  axisX: {type: Chartist.AutoScaleAxis},
  height: 300
});
// !arithmepad-cell {"cellType":"js","showLineNumbers":true}
payoff = (s) => Math.max(s - K, 0);

new Chartist.Line(plotId, {
  labels: _(ns).map(n => Math.round(S(T, n))),
  series: [_(ns).map(n => ({x: S(T, n), y: payoff(S(T, n))}))]
}, {
  axisX: {type: Chartist.AutoScaleAxis},
  lineSmooth: false,
  height: 300
});
// !arithmepad-cell {"cellType":"js","showLineNumbers":true}
npv = Math.pow(1+r, -T) * numeric.sum( _(ns).map(n => payoff(S(T, n)) * Q(T,n)) );
// !arithmepad-cell {"cellType":"js","showLineNumbers":false}
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
  series: series,
  colors: ['blue']
}, {
  axisX: {type: Chartist.AutoScaleAxis},
  height: 300
})
.on('draw', function(context) {
  if (context.type === 'line') {
    context.element.attr({
      style: 'stroke: blue; stroke-width: 1px'
    });
  }
  if (context.type === 'point') {
    context.element.attr({
      style: 'stroke: blue; stroke-width: 4px'
    });
  }
});
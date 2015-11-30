// !arithmepad-properties {"title":"Geometric Brownian Motion Example"}
// !arithmepad-cell
// # Geometric Brownian Motion Example
// - defines parameters mu and sigma
// - simulates a Geometric Brownian Motion (GBM) using these parameters
// - plots all simulated paths
// 
// !arithmepad-cell
mu = 0.08;
sigma = 0.2;
// !arithmepad-cell
n=3;
T=20;

x = _(_.range(n)).map(() => new Array(T));

for (var i=0; i<n; i++) {
  for (var t=0; t<T; t++) {
    x[i][t] = Math.random();
  }
}
// !arithmepad-cell
data = {labels: _.range(T), series: x};
new Chartist.Line(plotId, data);
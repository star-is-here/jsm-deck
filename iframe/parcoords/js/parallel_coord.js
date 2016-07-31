// var margin = {top: 30, right: 10, bottom: 10, left: 10},
//     width = 960 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

// var x = d3.scale.ordinal().rangePoints([0, width], 1),
//     y = {};

// var line = d3.svg.line(),
//     axis = d3.svg.axis().orient("left").tickFormat(""),
//     background,
//     foreground;

// var svg = d3.select("#coord").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// d3.csv("data/MDG611_clean.csv", function(error, mdg) {

//   // Extract the list of dimensions and create a scale for each.
//   x.domain(dimensions = d3.keys(mdg[0]).filter(function(d) {
//     return d != "name" && (y[d] = d3.scale.linear()
//         .domain(d3.extent(mdg, function(p) { return +p[d]; }))
//         .range([height, 0]));
//   }));

//   // Add grey background lines for context.
//   background = svg.append("g")
//       .attr("class", "background")
//     .selectAll("path")
//       .data(mdg)
//     .enter().append("path")
//       .attr("d", path);

//   // Add blue foreground lines for focus.
//   foreground = svg.append("g")
//       .attr("class", "foreground")
//     .selectAll("path")
//       .data(mdg)
//     .enter().append("path")
//       .attr("d", path);

//   // Add a group element for each dimension.
//   var g = svg.selectAll(".dimension")
//       .data(dimensions)
//     .enter().append("g")
//       .attr("class", "dimension")
//       .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

//   // Add an axis and title.
//   g.append("g")
//       .attr("class", "axis")
//       .each(function(d) { d3.select(this).call(axis.scale(y[2003])); })
//     .append("text")
//       .style("text-anchor", "middle")
//       .attr("y", -9)
//       .text(function(d) { return d; });

//   // Add and store a brush for each axis.
//   g.append("g")
//       .attr("class", "brush")
//       .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
//     .selectAll("rect")
//       .attr("x", -8)
//       .attr("width", 16);
// });

// // Returns the path for a given data point.
// function path(d) {
//   return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
// }

// // Handles a brush event, toggling the display of foreground lines.
// function brush() {
//   var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
//       extents = actives.map(function(p) { return y[p].brush.extent(); });
//   foreground.style("display", function(d) {
//     return actives.every(function(p, i) {
//       return extents[i][0] <= d[p] && d[p] <= extents[i][1];
//     }) ? null : "none";
//   });
// }

// linear color scale
var blue_to_red = d3.scale.linear()
  .domain([0, 1])
  .range(["rgb(52, 152, 219)", "rgb(231, 76, 60)"])
  .interpolate(d3.interpolateRgb);

// // interact with this variable from a javascript console
// var pc1;

// load csv file and create the chart
d3.json("MDG611.json", function(data) {

  var data2 = d3.range(data.length).map(function(i){
    return {
      Country: data[i].Country,
      '1990': parseFloat(data[i]['1990']),
      '1991': parseFloat(data[i]['1991']),
      '1992': parseFloat(data[i]['1992']),
      '1993': parseFloat(data[i]['1993']),
      '1994': parseFloat(data[i]['1994']),
      '1995': parseFloat(data[i]['1995']),
      '1996': parseFloat(data[i]['1996']),
      '1997': parseFloat(data[i]['1997']),
      '1998': parseFloat(data[i]['1998']),
      '1999': parseFloat(data[i]['1999']),
      '2000': parseFloat(data[i]['2000']),
      '2001': parseFloat(data[i]['2001']),
      '2002': parseFloat(data[i]['2002']),
      '2003': parseFloat(data[i]['2003']),
      '2004': parseFloat(data[i]['2004']),
      '2005': parseFloat(data[i]['2005']),
      '2006': parseFloat(data[i]['2006']),
      '2007': parseFloat(data[i]['2007']),
      '2008': parseFloat(data[i]['2008']),
      '2009': parseFloat(data[i]['2009']),
      '2010': parseFloat(data[i]['2010']),
      '2011': parseFloat(data[i]['2011']),
      '2012': parseFloat(data[i]['2012']),
      '2013': parseFloat(data[i]['2013']),
      '2014': parseFloat(data[i]['2014']),
      '2015': parseFloat(data[i]['2015']),
      '2016': parseFloat(data[i]['2016']),
      developed: parseInt(data[i]['developed'])
    };
  });

  // var pc = d3.parcoords({nullValueSeparator: "bottom"})("#coord")
  //   .data(data2)
  //   .render()
  //   .createAxes();

  // var dimensions = {
  //   '1990':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '1991':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '1992':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '1993':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '1994':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '1995':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '1996':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '1997':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '1998':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '1999':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2000':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2001':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2002':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2003':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2004':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2005':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2006':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2007':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2008':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2009':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2010':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2011':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2012':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2013':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2014':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2015':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)},
  //   '2016':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([0,1.4]).range(0,1.4,.01)}
  // };

  var dimensions = {
    '1990':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number"},
    '1991':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '1992':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '1993':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '1994':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '1995':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '1996':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '1997':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '1998':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '1999':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2000':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2001':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2002':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2003':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2004':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2005':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2006':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2007':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2008':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2009':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2010':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2011':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
    '2012':{domain:d3.range(0,1.4,.01), yscale:d3.scale.linear().domain([1.2,0]).range([0,350]), type:"number", ticks:0},
  };

  // console.log(d3.scale.linear().domain([0,1.4])(1.2))

  var pc1 = d3.parcoords()("#coord")
    .data(data2)
    .hideAxis(["Country", "developed", "2014", "2015", "2016"])
    .composite("source-over")
    .color(function(d) { return blue_to_red(parseInt(d['developed'])); })  // quantitative color scale
    // .alpha(0.35)
    .dimensions(dimensions)
    .render()
    .brushMode("1D-axes");

  d3.selectAll(".tick")
    .style('opacity',0);

  for (var i=0; i < d3.selectAll(".axis")[0][d3.selectAll(".axis")[0].length-1].children.length; i++) {
    d3.selectAll(".axis")[0][d3.selectAll(".axis")[0].length-1].children[i].style.opacity = 1.0;
  }

  // console.log(pc1.dimensions());
  // for (var axis in pc1.dimensions()) {
  //   // console.log(pc1.dimensions()[axis]);
  //   console.log(pc1.scale(pc1.dimensions()[axis]));
  // }

  // console.log(domain);
  // console.log(pc1.dimensions());
  // for (var axis in pc1.dimensions()) {
  //   pc1.scale(axis, domain);
  // };
  // pc1.dimensions().forEach(function(d) {
  //     pc1.scale(d, domain);
  // });

});


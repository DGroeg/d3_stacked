var data;

var Genders = ["Males", "Females"];

var Countries = [ "Belgium", "Bulgaria", "Germany", "Estonia", "Spain", "France", "Italy", "Latvia", "Lithuania", "Poland",
"Slovenia", "Finland", "United Kingdom", "Norway" ];
//"Total", 
var Fields = [ 
"Personal care",
"Employment, related activities and travel as part of/during main and second job",
"Study", "Household and family care", "Leisure, social and associative life", "Travel except travel related to jobs", 
"Unspecified time use"];

var PersonalCare = ["Sleep", "Eating", "Other and/or unspecified personal care"];
var Employment = ["Main and second job and related travel", "Activities related to employment and unspecified employment"];
var Study = ["School and university except homework", "Homework", "Free time study"];
var Household = ["Food management except dish washing", "Dish washing", 
"Cleaning dwelling", "Household upkeep except cleaning dwelling",
"Laundry", "Ironing", "Handicraft and producing textiles and other care for textiles", 
"Gardening; other pet care", "Tending domestic animals", "Caring for pets", "Walking the dog", 
"Construction and repairs", "Shopping and services",
"Childcare, except teaching, reading and talking", "Teaching, reading and talking with child", 
"Household management and help family member"];
var Leisure = [ "Organisational work", "Informal help to other households", "Participatory activities", 
"Visiting and feasts", "Other social life",
"Entertainment and culture", "Resting", 
"Walking and hiking", "Sports and outdoor activities except walking and hiking",
"Computer games", "Computing", "Hobbies and games except computing and computer games", 
"Reading books", "Reading, except books", "TV and video", "Radio and music", 
"Unspecified leisure"];
var Travel = ["Travel to/from work", "Travel related to study", "Travel related to shopping and services", "Transporting a child", 
"Travel related to other household purposes", "Travel related to leisure, social and associative life", "Unspecified travel"];
var AllCat = Fields.concat(PersonalCare).concat(Employment).concat(Study).concat(Household).concat(Leisure).concat(Travel);

var o_width=950*1.3, o_height=400*1.3;

var margin = {top: 20, right: 50, bottom: 30, left: 20},
    width = o_width - margin.left - margin.right,
    height = o_height - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width]);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var z = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right");

var svg = d3.select("svg.dataviz1")
    .attr("width", o_width)
    .attr("height", o_height)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data.csv", function(error, data) {
  if (error) throw error;
  data = data.reduce(function(accu,datum) {
    var found = accu.find(function(d){ return d.country == datum.COUNTRY});
    if (found == null) {
      var d = {"country":datum.COUNTRY};
      AllCat.forEach(function(key){
        d[key] = parseInt(datum[key],10)/2 || 0;
      });
      return accu.concat([d]);
    } else {
      AllCat.forEach(function(key){
        found[key] += parseInt(datum[key],10)/2 || 0;
      })
      return accu;
    }
  },[]);
  console.log(data);

  var layers = d3.layout.stack()(Fields.map(function(c) {
    return data.map(function(d) {
      return {x: d.country, y: d[c]};
    });
  }));
  x.domain(layers[0].map(function(d) { return d.x; }));
  y.domain([0,1440]);
  var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return z(i); });

  

  layer.selectAll("rect")
      .data(function(d) { console.log(d);return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y + d.y0); })
      .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
      .attr("width", x.rangeBand() - 1);

  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);
});



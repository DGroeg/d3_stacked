var data;

var Genders = ["Males", "Females"];

var Countries = [ "Belgium", "Bulgaria", "Germany", "Estonia", "Spain", "France", "Italy", "Latvia", "Lithuania", "Poland",
"Slovenia", "Finland", "UK", "Norway" ];
//"Total", 
var Fields = [ 
"Personal care",
"Employment, related activities and travel as part of/during main and second job",
"Household and family care", "Leisure, social and associative life", "Travel except travel related to jobs", 
"Unspecified time use"];

var PersonalCare = ["Sleep", "Eating", "Other and/or unspecified personal care"];
var Employment = ["Main and second job and related travel", "Activities related to employment and unspecified employment",
"School and university except homework", "Homework", "Free time study"];
//var Study = ["School and university except homework", "Homework", "Free time study"];
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
var Categories = {"Leisure, social and associative life":Leisure,"Personal care":PersonalCare,
"Employment, related activities and travel as part of/during main and second job":Employment,
"Household and family care":Household,"Travel except travel related to jobs":Travel,"Unspecified time use":null};


var AllCat = Fields.concat(PersonalCare).concat(Employment).concat(Household).concat(Leisure).concat(Travel);

var o_width=950*1, o_height=400*1;

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

d3.csv("data.csv", function(error, _data) {
  if (error) throw error;
  data = _data.reduce(function(accu,datum) {
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
  //console.log(data);

  var layers = d3.layout.stack()(Fields.map(function(c,category_n) {
    return data.map(function(d) {
      return {x: d.country, y: d[c], category_n:category_n, category:c};
    });
  }));
  x.domain(layers[0].map(function(d) { return d.x; }));
  y.domain([0,1440]);
  var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", function(d,i) {return "layer-"+i;})
      .style("fill", function(d, i) { return z(i); });

  layer.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(0); })
      .attr("width", x.rangeBand() - 1)
      .attr("height", 0)
      .on("mouseenter",function(d,i){
        d3.select(".layer-"+d["category_n"]).style("stroke","#FFFFFF").style("stroke-width",3); 
		var xPos = parseFloat(d3.select(this).attr("x"));
		var yPos = parseFloat(d3.select(this).attr("y"));
		var height = parseFloat(d3.select(this).attr("height"))
		svg.append("text")
			.attr("x",10)
			.attr("y",315)
			.attr("class","tooltip")
			.text(d.y+" minutes per day of "+d.category+" in "+d.x);
      })
      .on("mouseleave",function(d,i){
        d3.select(".layer-"+d["category_n"]).style("stroke","#FFFFFF").style("stroke-width",0);
		svg.select(".tooltip").remove();
      })
      .on("click",function(d,i){
        d3.select(".caption2").text(d["category"]);
        addSvg2(Categories[d["category"]]);
      })
      .transition()
      .duration(400)
      .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
      .attr("y", function(d) { return y(d.y + d.y0); });
  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis)
	  .append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 40)
	  .attr("dy", ".71em")
	  .style("text-anchor", "end")
	  .text("Time used for the activity each day in minutes");
});

var svg2 = d3.select("svg.dataviz2")
    .attr("width", o_width)
    .attr("height", o_height)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function addSvg2(category) {
    if (category == null){
      console.log("No data for Unspecified!");
	  category = ["Unspecified time use"];
    }
	d3.select(".caption2").text();
    svg2.selectAll("*").remove();
	d3.select(".caption3").text("");
    svg3.selectAll("*").remove();
	  var layers = d3.layout.stack()(category.map(function(c,category_n) {
		return data.map(function(d) {
		  return {x: d.country, y: d[c], category_n:category_n, category:c};
		});
	  }));
	  x.domain(layers[0].map(function(d) { return d.x; }));
	  var max = 0;
	  data.map(function(d) {
		  var sum = 0;
		  category.forEach(function(key) {
			sum = sum + d[key];
		  });
		  if (sum > max){
			  max = sum;
		  };
		});
	  //console.log(max);
	  y.domain([0,max]);
	  var layer = svg2.selectAll(".layer")
		  .data(layers)
		.enter().append("g")
		  .attr("class", function(d,i) {return "layer2-"+i;})
		  .style("fill", function(d, i) { return z(i); });

	  layer.selectAll("rect")
		  .data(function(d) { return d; })
		.enter().append("rect")
		  .attr("x", function(d) { return x(d.x); })
		  .attr("y", function(d) { return y(0); })
		  .attr("height", 0)
		  .attr("width", x.rangeBand() - 1)
		  .on("mouseenter",function(d,i){
			  if (category[0] !== "Unspecified time use"){
				  d3.select(".layer2-"+d["category_n"]).style("stroke","#FFFFFF").style("stroke-width",3); 
			  }
			  var xPos = parseFloat(d3.select(this).attr("x"));
			var yPos = parseFloat(d3.select(this).attr("y"));
			var height = parseFloat(d3.select(this).attr("height"))
			svg2.append("text")
				.attr("x",10)
				.attr("y",315)
				.attr("class","tooltip")
				.text(d.y+" minutes per day of "+d.category+" in "+d.x);
		  })
		  .on("mouseleave",function(d,i){
			 if (category[0] !== "Unspecified time use"){
				d3.select(".layer2-"+d["category_n"]).style("stroke","#FFFFFF").style("stroke-width",0);
			 }
			 svg2.select(".tooltip").remove();
		  })
		  .on("click",function(d,i){
<<<<<<< HEAD
			  if (category[0] !== "Unspecified time use"){
				  d3.select(".caption3").text(d["category"]);
				  addSvg3([d["category"]]);
			  }
		  });
=======
        d3.select(".caption3").text(d["category"]);
			  addSvg3([d["category"]]);
		  })
      .transition()
      .duration(400)
		  .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
		  .attr("y", function(d) { return y(d.y + d.y0); })
      ;
>>>>>>> origin/master
	  svg2.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);

	  svg2.append("g")
		  .attr("class", "axis axis--y")
		  .attr("transform", "translate(" + width + ",0)")
		  .call(yAxis)
		  .append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 40)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("Time used for the activity each day in minutes");
};


var svg3 = d3.select("svg.dataviz3")
    .attr("width", o_width)
    .attr("height", o_height)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function addSvg3(category) {
	console.log(category);
    svg3.selectAll("*").remove();
	  var layers = d3.layout.stack()(category.map(function(c,category_n) {
		return data.map(function(d) {
		  return {x: d.country, y: d[c], category_n:category_n};
		});
	  }));
	  x.domain(layers[0].map(function(d) { return d.x; }));
	  var max = 0;
	  data.map(function(d) {
		  var sum = 0;
		  category.forEach(function(key) {
			sum = sum + d[key];
		  });
		  if (sum > max){
			  max = sum;
		  };
		});
	  //console.log(max);
	  y.domain([0,max]);
	  var layer = svg3.selectAll(".layer")
		  .data(layers)
		.enter().append("g")
		  .attr("class", function(d,i) {return "layer3-"+i;})
		  .style("fill", function(d, i) { return z(i); });

	  layer.selectAll("rect")
		  .data(function(d) { return d; })
		.enter().append("rect")
		  .attr("x", function(d) { return x(d.x); })
<<<<<<< HEAD
		  .attr("y", function(d) { return y(d.y + d.y0); })
		  .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
		  .attr("width", x.rangeBand() - 1)
		  .on("mouseenter",function(d,i){
			svg3.append("text")
				.attr("x",10)
				.attr("y",315)
				.attr("class","tooltip")
				.text(d.y+" minutes per day of "+d.category+" in "+d.x);
		  })
		  .on("mouseleave",function(d,i){
			svg3.select(".tooltip").remove();
		  });
=======
		  .attr("y", function(d) { return y(0); })
		  .attr("height", 0)
		  .attr("width", x.rangeBand() - 1)
      .transition()
      .duration(50)
      .delay(function(d,i) {return i*50})
      .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
      .attr("y", function(d) { return y(d.y + d.y0); });;
>>>>>>> origin/master
	  svg3.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);
		  
	  svg3.append("g")
		  .attr("class", "axis axis--y")
		  .attr("transform", "translate(" + width + ",0)")
		  .call(yAxis)
		  .append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 40)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("Time used for the activity each day in minutes");
};




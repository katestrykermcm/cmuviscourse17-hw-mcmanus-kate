// Global var for FIFA world cup data
var allWorldCupData;

/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function updateBarChart(selectedDimension) {

    var svgBounds = d3.select("#barChart").node().getBoundingClientRect(),
        // add padding on all sides
        padding = 80;
        // the height and width of the actual drawing area
        xAxisWidth = svgBounds.width - padding * 2;
        yAxisHeight = svgBounds.height - padding * 2;

        

    // Scale for X axis
    var minYear = d3.min(allWorldCupData, function(d){
        return d.year;
    });
    var maxYear = d3.max(allWorldCupData, function(d){
        return d.year;
    });
    // x : 1930 - 2014
    var xScale = d3.scaleLinear()
            // i think this is where to start the count w.r.t data
            .domain([minYear, maxYear])
            // i think this is x value to place at
            .range([0, xAxisWidth]); 
            //.nice();
    // alternative option to explore
    // var xScale = d3.scaleBand().range([0, xAxisWidth]).padding(.1);        


    // Create X axis
    var xContainer = d3.select("#xAxis");
    // get year tick values from data 
    var xValues = allWorldCupData.map(function (d) {
        return d.year;
    });
    // add missing years
    xValues.push(1942);
    xValues.push(1946);
    var xAxis = d3.axisBottom()
        .tickValues(xValues)
        // removes commas from the years ex. 2,000 -> 2000
        .tickFormat(d3.format("d"));
    // assign the scale to the axis
    xAxis.scale(xScale);
    xContainer.append("g")
        .attr("transform", "translate(" + (padding + ((xAxisWidth / allWorldCupData.length)/2)) + ", " + (padding + yAxisHeight) + ")")
        .call(xAxis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");


    // Scale for Y axis
    var maxY = d3.max(allWorldCupData, function(d){
        return d[selectedDimension];
    });
    var yScale = d3.scaleLinear()
        .domain([0, maxY])
        .range([yAxisHeight, 0]);


    // Create Y axis
    var yContainer = d3.select("#yAxis");
    yContainer = yContainer.enter()
        .append("g")
        .merge(yContainer);
    yContainer.exit().remove();
    yContainer
        // moving the axis to the right place
        .transition().attr("transform", "translate(" + padding + ", " + padding + ")")
        .call(d3.axisLeft().scale(yScale));



    // Create colorScale
    var colorScale = d3.scaleLinear().domain([0, maxY])
        .range(["yellow", "red"]);


    // Create the bars
    // Select all rect's in #bars and bind the world cup data to them
    var bars = d3.select("#bars").selectAll("rect").data(allWorldCupData);
    // handle the enter() condition and merge with existing rects
    bars = bars.enter()
            .append('rect')
            .merge(bars);
    // handle the exit() case to remove any bars that no longer have data assigned to them
        bars.exit().remove();
     // finally, assign the necessary attributes to the bars   
        bars
            // new: we add the padding via a tranform/translate
            .attr("transform", "translate(" + padding + "," + padding + ")")
            // Implement how the bars respond to click events
            .on("click", function() {
                // Make sure only the selected bar has this new color
                d3.select("#bars").selectAll("rect").style('fill', function (d) {
                        return  colorScale(d[selectedDimension]);
                    });
                // Color the selected bar to indicate is has been selected
                d3.select(this).style("fill", "purple");
                // Output the selected bar to the console using console.log()
                console.log(d3.select(this));
                d3.event.stopPropagation();
            })
            .transition().attr('x', function (d) { // starting x point for individual bars
                return  xScale(d.year);
            })
            .attr('width', function (d) { // width of individual bars
                return  (xAxisWidth / allWorldCupData.length);
            })
            .attr('y', function (d) {
                return yScale(d[selectedDimension]);
            })
            .attr('height', function (d) {
                return  yAxisHeight - yScale(d[selectedDimension]);
            })
            .attr('fill', function (d) {
                return  colorScale(d[selectedDimension]);
            });
}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */
function chooseData() {
    // clear data about previous dimensions in the axes
    //d3.selectAll("g").html("");
    // Changed the selected data when a user selects a different menu item from the drop down
    var selectMenu = document.getElementById("dataset");
    var newDimension = selectMenu.options[selectMenu.selectedIndex].value;
    updateBarChart(newDimension);
}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

// Load CSV file
d3.csv("data/fifa-world-cup.csv", function (error, csv) {

    csv.forEach(function (d) {

        // Convert numeric values to 'numbers'
        d.year = +d.YEAR;
        d.teams = +d.TEAMS;
        d.matches = +d.MATCHES;
        d.goals = +d.GOALS;
        d.avg_goals = +d.AVERAGE_GOALS;
        d.attendance = +d.AVERAGE_ATTENDANCE;
        //Lat and Lons of gold and silver medals teams
        d.win_pos = [+d.WIN_LON, +d.WIN_LAT];
        d.ru_pos = [+d.RUP_LON, +d.RUP_LAT];

        //Break up lists into javascript arrays
        d.teams_iso = d3.csvParse(d.TEAM_LIST).columns;
        d.teams_names = d3.csvParse(d.TEAM_NAMES).columns;

    });

    // Store csv data in a global variable
    allWorldCupData = csv;
    // Draw the Bar chart for the first time
    updateBarChart("attendance");
});






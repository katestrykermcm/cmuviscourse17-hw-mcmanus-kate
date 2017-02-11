// Global var for FIFA world cup data
var allWorldCupData;


/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function updateBarChart(selectedDimension) {

    var svgBounds = d3.select("#barChart").node().getBoundingClientRect(),
        xAxisWidth = 100,
        yAxisHeight = 70;

    // ******* TODO: PART I *******
    // Copy over your HW2 code here
}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */
function chooseData() {

  // ******* TODO: PART I *******
  // Copy over your HW2 code here

}

/**
 * Update the info panel to show info about the currently selected world cup
 *
 * @param oneWorldCup the currently selected world cup
 */
function updateInfo(oneWorldCup) {

    // ******* TODO: PART II *******

    // Update the text elements in the infoBox to reflect:
    // World Cup Title, host, winner, runner_up, and all participating teams that year

    // Hint: For the list of teams, you can create an list element for each team.
    // Hint: Select the appropriate ids to update the text content.


}

/**
 * Renders and updated the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */
function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)

    projection = d3.geoConicConformal().scale(150).translate([400, 350]);

    // ******* TODO: PART III *******

    // Draw the background (country outlines; hint: use #map)
    // Make sure and add gridlines to the map

    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id

    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)


}

/**
 * Clears the map
 */
function clearMap() {

    // ******* TODO: PART IV*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.

}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
function updateMap(worldcupData) {

    //Clear any previous selections;
    clearMap();

    // ******* TODO: PART IV *******

    // Add a marker for the winner and runner up to the map.

    //Hint: remember we have a conveniently labeled class called .winner
    // as well as a .silver. These have styling attributes for the two
    //markers.


    //Select the host country and change it's color accordingly.

    //Iterate through all participating teams and change their color as well.

    //We strongly suggest using classes to style the selected countries.



}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

//Load in json data to make map
d3.json("data/world.json", function (error, world) {
    if (error) throw error;
    drawMap(world);
});

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
    updateBarChart('attendance');
});

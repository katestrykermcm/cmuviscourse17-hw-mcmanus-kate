/** Global var to store all match data for the 2014 Fifa cup */
var teamData;

/** Global var for list of all elements that will populate the table.*/
var tableElements;


/** Variables to be used when sizing the svgs in the table cells.*/
var cellWidth = 70,
    cellHeight = 20,
    cellBuffer = 15,
    barHeight = 20;

/**Set variables for commonly accessed data columns*/
var goalsMadeHeader = 'Goals Made',
    goalsConcededHeader = 'Goals Conceded';

/** Setup the scales*/
var goalScale = d3.scaleLinear()
    .range([cellBuffer, 2 * cellWidth - cellBuffer]);

/**Used for games/wins/losses*/
var gameScale = d3.scaleLinear()
    .range([0, cellWidth - cellBuffer]);

/**Color scales*/
/**For aggregate columns*/
var aggregateColorScale = d3.scaleLinear()
    .domain([0,7])
    .range(['#ece2f0', '#016450']);

/**For goal Column*/
var goalColorScale = d3.scaleQuantize()
    .domain([-1, 1])
    .range(['#cb181d', '#034e7b']);

/**json Object to convert between rounds/results and ranking value*/
var rank = {
    "Winner": 7,
    "Runner-Up": 6,
    'Third Place': 5,
    'Fourth Place': 4,
    'Semi Finals': 3,
    'Quarter Finals': 2,
    'Round of Sixteen': 1,
    'Group': 0
};

d3.json('data/fifa-matches.json',function(error,data){
    teamData = data;
    createTable();
    updateTable();
})

/**
 * Loads in the tree information from fifa-tree.csv and calls createTree(csvData) to render the tree.
 *
 */
d3.csv("data/fifa-tree.csv", function (error, csvData) {

    //Create a unique "id" field for each game
    csvData.forEach(function (d, i) {
        d.id = d.Team + d.Opponent + i;
    });

    createTree(csvData);
});

/**
 * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
 * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
 *
 */
function createTable() {

    // ******* TODO: PART II *******
    var svg = d3.select("#goalHeader").append("svg")
      .attr("width", 200)
      .attr("height", cellHeight);

    // defines scale based on possible values (domain) and expected size (range)
    var allGoals = getValues(teamData,'Goals Made');
    var maxGoal = Math.max.apply(null, allGoals);
    goalScale = d3.scaleLinear()
                .domain([0,maxGoal]) 
                .range([10,180]);  
    
    // defines axis for that scale
    // (types: axisBottom, axisTop, axisRight, axisLeft)
    // must be called (svg.call)
    var axis = d3.axisBottom(goalScale);

    // puts the axis inside a group positioned by translate
    svg.append("g")
        .attr("transform", "translate(0,0)")
        .style("font-size","8px")
        .call(axis);   

    tableElements = teamData;

    // ******* TODO: PART V (Extra Credit) *******

}

// code from: http://techslides.com/how-to-parse-and-search-json-in-javascript
//return an array of values that match on a certain key
function getValues(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getValues(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}

/**
 * Updates the table contents with a row for each element in the global variable tableElements.
 *
 */
function updateTable() {

    // ******* TODO: PART III *******

    //Remove all the elements from the tbody
    d3.select("tbody").selectAll("tr").remove();

    // create a row for each object in the data
    // bc every data element will be associated to one row, we want to append the data from our tableElements list to the <tr> elements
    var rows = d3.select("tbody").selectAll("tr")
        .data(tableElements)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.on("click", function(d, i) { // Add click listener
                // Click on any aggregate row to expand the table and show an extra row for each match played by that country
                updateList(i);
            })
            .on("mouseover", function(d, i){
                updateTree(i);
            })
            .selectAll("td")
        // Notice how we are not passing in new data to the <td> elements, but only a function that will
        // manipulate the data being passed down from tr, which is the parent element. This will generate
        // as many <td> elements as there are data elements in the array returned by your function(d){}.
        .data(function(d) {
            // create data array here
            // Type: aggregate or game row
            // Vis: what kind of vis we will use for that data (ex. bar, goals, text)
            // Value: Actual value we want to visualize in that cell
            return data = [
                {"type": d.value.type, "vis": "text", "value":d.key},
                {"type": d.value.type, "vis": "goals", "value":[d.value["Goals Conceded"], d.value["Goals Made"], d.value["Delta Goals"]]},
                {"type": d.value.type, "vis": "text", "value":d.value.Result.label},
                {"type": d.value.type, "vis": "bar", "value":d.value.Wins},
                {"type": d.value.type, "vis": "bar", "value":d.value.Losses},
                {"type": d.value.type, "vis": "bar", "value":d.value.TotalGames}
            ];
        })
        .enter()
        .append("td");

    // Select all <td> elements in the Wins, Losses, and Total Games columns.
    // You can do this by selecting all <td>'s and filtering by the vis attribute in your data element
    var aggregateCells = cells.filter(function (d) {
            return d.vis == 'bar' && d.type == "aggregate";
        })
        .append("svg")
        .attr("width", cellWidth)
        .attr("height", cellHeight);

    // In each selected element, create a new <svg> element and add a <rect> element
    var aggregateRects = aggregateCells.append("rect")
        .attr("width", function (d) {
            return  d.value * 8;
        })
        .attr("height", barHeight)
        // These bars should be colored by the absolute value of the associated property
        .attr("y", 2)
        .style("fill", function (d) {
            return aggregateColorScale(Math.abs(d.value));
        });

    // label with the numeric value of that attribute
    aggregateCells.append("text")
        .attr("x", function (d) {
            return  (d.value * 8) - 12;
        })
        .attr("y", barHeight / 2 + 4.5)
        .attr("fill", "white")
        //.attr("dy", ".35em")
        .text(function (d) {
            if (d.value > 1){
                return d.value;
            }
    });
        
    // Select all <td> elements in the Wins, Losses, and Total Games columns.
    // You can do this by selecting all <td>'s and filtering by the vis attribute in your data element
    var goalCells = cells.filter(function (d) {
            return d.vis == 'goals';
        })
        .append("svg")
        .attr("width", 180)
        .attr("height", cellHeight);

    // Visualize a summary of a teams performance: 
    // goal difference is encoded by a bar
    var goalRects = goalCells.append("rect")
        .attr("width", function (d) {
            if (d.type != "aggregate"){
                // weirdly isn't in the data -- need to make the value for the games!
                d.value[2] = Math.abs(d.value[1] - d.value[0]);
            }
            return goalScale(Math.abs(d.value[2])) - 8;
        })
        .attr("height", function (d) {
            if (d.type != "aggregate"){
                // make skinnier rectangles to differentiate games from teams
                return 3;
            }
            return 10;
        })
        .attr("x", function (d) {
            var val0 = d.value[0];
            var val1 = d.value[1];
            if (val0 > val1){
                return goalScale(d.value[1]) - 4;
            }
            else if (val1 > val0) {
                return goalScale(d.value[0]) - 4;
            }
            // ignore if tie
        })
        .attr("y", function (d) {
            if (d.type != "aggregate"){
                // vertically center skinnier rectangles
                return 9;
            }
            return 6;
        })
        // make opacity lighter than circles so the cirlces will stand out better
        .attr('fill-opacity', 0.2)
        .style("fill", function (d) {
            var val0 = d.value[0];
            var val1 = d.value[1];
            // negative goal difference highlighted by a red bar
            if (val0 > val1){
                return goalColorScale(-1);
            }
            // positive goal difference highlighted by a blue bar
            else if (val1 > val0) {
                return goalColorScale(1);
            }
            // hide if tie
            else{
                return "white";
            }
        });

    // Goals are encoded using position
    // The marks are RED for the conceded goals
    var goalCirclesConceded = goalCells.append("circle")
        .attr("cx", function (d) { return goalScale(d.value[0]) - 4; })
        .attr("cy", function (d) { return 11; })
        .attr("r", function (d) { return 5; })
        .style("stroke", function(d) {
            if (d.type != "aggregate"){
                return goalColorScale(-1);
            }
        })
        .style("stroke-width", function(d) {
            if (d.type != "aggregate"){
                return 2;
            }
        })
        .style("fill", function(d) {
            if (d.type != "aggregate"){
                return "white";
            }
            return goalColorScale(-1);
        }); 

    // The marks are BLUE for the made goals
    var goalCirclesMade = goalCells.append("circle")
        .attr("cx", function (d) { return goalScale(d.value[1]) - 4; })
        .attr("cy", function (d) { return 11; })
        .attr("r", function (d) { return 5; })
        .style("fill", function(d) { 
            if (d.type != "aggregate"){
                return "white";
            }
            else{
                var val0 = d.value[0];
                var val1 = d.value[1];
                if (val0 == val1){
                    return "gray";
                }
                // Gray markers are used for ties - will cover red if they were drawn previously bc draw last
                else {
                    return goalColorScale(1);
                }
            }
        })
        .style("stroke", function(d) {
            if (d.type != "aggregate"){
                var val0 = d.value[0];
                var val1 = d.value[1];
                if (val0 == val1){
                    return "gray";
                }
                else {
                    return goalColorScale(1);
                }
            }
        })
        .style("stroke-width", function(d) {
            if (d.type != "aggregate"){
                return 2;
            }
        });


    var textCells = cells.filter(function (d) {
            return d.vis == 'text';
        })
        .append("svg")
        .attr("width", 120)
        .attr("height", cellHeight);

    // Team and Results columns
    textCells.append("text")
        .attr("fill", function (d, i) {
            if (i < 1 && d.type == "aggregate"){
                return "green";
            }
            else if (i < 1){
                return "#C6C6C6";
            }
            return "black";
        })
        .style("text-anchor", function (d, i) {
            if (i < 1){
                return "end";
            }
            return "start";
        })
        .attr("x", function (d, i) {
            if (i < 1){
                return 120;
            }
            return 0;
        })
        .attr("y", barHeight / 2 + 5)
        .text(function (d, i) {
            if (i < 1 && d.type != "aggregate"){
                return "x" + d.value;
            }
            return d.value;
        });
};


/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {

    // ******* TODO: PART IV *******
    // i handled this using the splice method below


}

/**
 * Updates the global tableElements variable, with a row for each row to be rendered in the table.
 * @param i: row index (i.e, the element in the list aka team that was clicked)
 */
function updateList(i) {

    // ******* TODO: PART IV *******
    var allCurrentGames = tableElements[i]['value']['games'];
    // if team clicked
    if (tableElements[i].value.type == "aggregate"){
        // if not last element in the array (avoid null pointer?)
        if ((tableElements.length - 1) != i){
            // next element is a game (clicked team's games are already expanded)
            if (tableElements[i+1].value.type != "aggregate"){
                // remove the games associated with the clicked game
                tableElements.splice(i+1, allCurrentGames.length);
            }
            // next element is a team (clicked team's games are NOT expanded, and should be)
            else{
                // add its games to the list following the team's entry
                addGamesToList(allCurrentGames, i);
            }
        }
        // the next element in the list is also a team or it's the last team listed
        else{
            addGamesToList(allCurrentGames, i);
        }
        updateTable();
    };
    // If a game was clicked, do nothing
}

function addGamesToList(allGames, i){
    for (var game = allGames.length -1; game >= 0; game--){
        tableElements = teamData;
        tableElements.splice(i + 1, 0, allGames[game]);
    }
}

function getOriginalList(){
    console.log('ok');
    console.log(teamData);
}

/**
 * Creates a node/edge structure and renders a tree layout based on the input data
 *
 * @param treeData an array of objects that contain parent/child information.
 */
function createTree(treeData) {

    // ******* TODO: PART VI *******
    // create the parent/node relationship between the games
    var root = d3.stratify()
        // .id is unique identifier for each node
        .id(function(d) {
            return d.id;
        })
        // .parentId indicates what field contains the parent Node to that element
        .parentId(function(d) {
            if (treeData[d.ParentGame] != undefined){
                return treeData[d.ParentGame].id;
            }
            else{
                return null;
            }
        })
        (treeData);

    var svgHeight;
    var svgWidth;
    var svgTree = d3.select("#treeSVG")
        .node()
        .getBoundingClientRect(),
            svgHeight = svgTree.height;
            svgWidth = svgTree.width;

    // declares a tree layout and assigns the size
    var treemap = d3.tree()
        .size([svgHeight - 250, svgWidth - 250]);

    //  assigns the data to a hierarchy using parent-child relationships
    var nodes = d3.hierarchy(root, function(d) {
        //console.log("children: ");
        //console.log(d.children);
        return d.children;
      });

    // maps the node data to the tree layout
    nodes = treemap(nodes);

    g = d3.select("#treeSVG").append("g")
          .attr("transform", "translate(100,100)"); 

    // adds the links between the nodes
    var link = g.selectAll(".link")
        .data( nodes.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .style("stroke", function(d) { return d.data.level; })
    .attr("d", function(d) {
        return "M" + d.y + "," + d.x
         + "C" + (d.y + d.parent.y) / 2 + "," + d.x
         + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
         + " " + d.parent.y + "," + d.parent.x;
    });

    // adds each node as a group
    var node = g.selectAll(".node")
        .data(nodes.descendants())
        .enter().append("g")
        .attr("class", function(d) { 
            return "node" + (d.children ? " node--internal" : " node--leaf"); })
        .attr("transform", function(d) { 
            return "translate(" + d.y + "," + d.x + ")";
        });

    // adds the circle to the node
    node.append("circle")
        .attr("r", function(d) {
            return 5;
        })
        .style("stroke", function(d) {
            return d.data.type;
        })
        .style("fill", function(d) {
            if (d.data.data.Wins > 0){
                return goalColorScale(1);
            }
            return goalColorScale(-1);
        });


                // var val0 = d.value[0];
                // var val1 = d.value[1];
                // if (val0 == val1){
                //     return "gray";
                // }
                // // Gray markers are used for ties - will cover red if they were drawn previously bc draw last
                // else {
                //     return goalColorScale(1);


    // adds the text to the node
    node.append("text")
        .attr("dy", ".35em")
        .attr("x", function(d) { return d.children ? 
        (d.data.value + 4) * -1 : d.data.value + 4 })
        .style("text-anchor", function(d) { 
            return d.children ? "end" : "start";
        })
        .text(function(d) {
            return d.data.data.Team;
        });
    

};

/**
 * Updates the highlighting in the tree based on the selected team. (link the table and the tree)
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table
 */
function updateTree(row) {

    // ******* TODO: PART VII *******

    // reset
    clearTree();
    
    var mouseoverRow = tableElements[row];

    // hover over row (team or game)
    if(mouseoverRow.value.Result.label != "Group"){
        var treeGroup = d3.select("#treeSVG");
        // if user hovers over any aggregate row
        if(mouseoverRow.value.type == "aggregate"){
            // highlight tree for all the games that country played in (& connecting links)
            treeGroup.selectAll(".link")
                .filter(function(d){
                    return d.data.data.Team == mouseoverRow.key && d.parent.data.data.Team == mouseoverRow.key;
                })
                .classed("selected",true);
            treeGroup.selectAll("text")
                .filter(function(d){
                    return d.data.data.Team == mouseoverRow.key;
                })
                .classed("selectedLabel",true);
        }
        // if user hovers over a game row
        else{
            // only that game should highlight in the tree
            treeGroup.selectAll(".link").filter(function(d){
                return (d.data.data.Team == mouseoverRow.key && d.data.data.Opponent == mouseoverRow.value.Opponent)
                || (d.data.data.Opponent == mouseoverRow.key && d.data.data.Team == mouseoverRow.value.Opponent);
            })
            .classed("selected",true);
            treeGroup.selectAll("text").filter(function(d){
                return (d.data.data.Team == mouseoverRow.key && d.data.data.Opponent == mouseoverRow.value.Opponent)
                || (d.data.data.Opponent == mouseoverRow.key && d.data.data.Team == mouseoverRow.value.Opponent);
            })
            .classed("selectedLabel",true);
        }
    }
}

/**
 * Removes all highlighting from the tree.
 */
function clearTree() {
    // ******* TODO: PART VII *******
    d3.selectAll(".selected").classed("selected",false);
    d3.selectAll(".selectedLabel").classed("selectedLabel",false);
}

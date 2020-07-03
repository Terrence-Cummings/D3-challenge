// D3 Challenge
// Terrence Cummings

/*
Steps:
1. Create canvas
2. Creat chart area
3. Create functions to:
    a. Set X and Y axis scales based on selected data to plot.
    b. Build the X and Y axis
    c. Build circles for each X, Y plot.
    d. Place state abbreviation labels on each circle.
    e. Create tooltip for each circle with State Name, X/Y Labels, X/Y Data. 
4. Retrieve data from CSV.
5. Call above functions
6. Use D3 to create and modify HTML elements to place on webpage
7. Listen for change in selected X and Y data. Redo everything if there is a change.
*/

// Create initial canvas
var svgWidth = 1200;
var svgHeight = 700;

// Set margins between chart area and canvas
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Calculate the height and width of the chart
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create and svg area for the chart
var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group to hold all the chart pieces
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initialize starting X and Y axis parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function to update the X axis scale based on the selected X data
function xScale(censusData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
            d3.max(censusData, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, width]);

    return xLinearScale;
}

// Function to update the Y axis scale based on the selected Y data
function yScale(censusData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.max(censusData, d => d[chosenYAxis]) * 1.2,
            d3.min(censusData, d => d[chosenYAxis]) * 0.9
        ])
        .range([0, height]);

    return yLinearScale;
}

// Transition and draw new X axis when X data changes
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Transition and draw new Y axis when Y data changes
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Transition and draw new data circles when X or Y data changes
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Transition and draw new data circle text labels when X or Y data changes
function renderCirclesText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]) - 6)
        .attr("y", d => newYScale(d[chosenYAxis]) + 4);

    return textGroup;
}

// Update tooltips data when X or Y data changes
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
    var yLabel;

    if (chosenXAxis === "poverty") {
        xLabel = "Poverty:";
    } else if (chosenXAxis === "age") {
        xLabel = "Age:";
    } else {
        xLabel = "Income:";
    };

    if (chosenYAxis === "healthcare") {
        yLabel = "Lack Healthcare:";
    } else if (chosenYAxis === "smokes") {
        yLabel = "Smokes:";
    } else {
        yLabel = "Obesity:";
    };

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });

    // Assign a new tooltip to each circle
    circlesGroup.call(toolTip);

    // Show tooltip on mouseover, hide on mouseout
    circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/censusDataOrig.csv").then(function(censusData, err) {
    if (err) throw err;

    // Change text numbers to numeric
    censusData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // Get the X and Y scales based on the selected X and Y data
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append the X axis 
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append the Y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, 0)`)
        .call(leftAxis);

    // Append a circle for each x,y datapoint
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5")

    // Create a group for the state abbreviations
    var circLabels = chartGroup.append("g")
        .classed("circ_labels", true);

    // Write the state abbreviations to the same locations as their associated circle
    var textGroup = circLabels.selectAll('text')
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]) - 6)
        .attr("y", d => yLinearScale(d[chosenYAxis]) + 4)
        .text(d => d.abbr)
        .attr("font-size", "10px")
        .attr("fill", "white");

    // Create group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // Create the 3 X axis labels
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for three y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    // Create 3 Y axis labels
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .classed("axis-text", true)
        .text("Lack Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Obese (%)");

    // Set initial tooltip based on chosen X and Y data
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Listen for click on one of the 3 X axis labels
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = xValue;

                // updates x scale for new data
                xLinearScale = xScale(censusData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates circle labels
                textGroup = renderCirclesText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Bold the selected X axis label by changing class
                if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

    // Listen for click on one of the 3 Y axis labels
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var yValue = d3.select(this).attr("value");
            if (yValue !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = yValue;

                // updates y scale for new data
                yLinearScale = yScale(censusData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // update state abbreviations
                textGroup = renderCirclesText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Bold the selected Y axis label by changing class
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "obesity") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
}).catch(function(error) {
    console.log(error);
});
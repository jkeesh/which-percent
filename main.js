
// This it the target population, in millions
var POPULATION = 158186786;

// This is the number of working hours.
var HOURS_PER_DAY = 8;
var DAYS_PER_WEEK = 5;
var WEEKS_PER_YEAR = 52;
var WORKING_HOURS = HOURS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_YEAR;

// Median income
var MEDIAN_INCOME = 28851;

// Fed min wage
var FED_MIN_WAGE = 7.25;

// This is the starting income for the visualization
var DEFAULT_INCOME = MEDIAN_INCOME;

// Poverty line
var POVERTY_INCOME = 11770;

// Elite line
var ELITE_INCOME = 1000000;

// Billion line
var BILLION_INCOME = 1000000000;

var MIN_INDEX = 4;
var MAX_INDEX = 5;
// This is the 1st index of the array, which is the percentile
var PERCENT_INDEX = 3;
var RANGE_INDEX = 0;
var COUNTS_INDEX = 1;

function english(n){
    if(n > 1e6){
        return (n / 1e6).toFixed(3) + " million ";
    }
    return parseInt(n.toFixed(0)).toLocaleString();
}


// http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
function to$(n){
    return n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}

// Round a number to this number of places
Number.prototype.round = function(places) {
  return +(Math.round(this + "e+" + places)  + "e-" + places);
}

// Conver this to a money format
function toMoney(n, short){
    var x = to$(n);
    if(short){
        return "$" + x.substring(0, x.length - 3);
    }

    return "$" + x;
}


// Return the count of people in this range. How many people
// in the data array are between start and end
function sumFromTo(data, start, end){
    var sum = 0;
    for(var i = 0; i < data.length; i++){
        var cur = data[i];
        var min = cur[MIN_INDEX];
        var max = cur[MAX_INDEX];

        if(start <= min && max < end){
            sum += cur[COUNTS_INDEX];
        }
    }
    return sum;
}

/*
Return an object of the format

{
    graphX: [1, 2, 3...],
    graphY: [1, 2, 3...]
}

to be used in a graph. Process the data array and return an object with
the X axis and Y axis graph arrays based on the number of people within the
income range on the x axis.

bucketSize is the size of the buckets, for example 50000 would do 50000 buckets
numBuckets shows how many buckets you want to calculate

*/
function createGraphArrays(bucketSize, numBuckets){
    var graphX = [];
    var graphY = [];
    for(var i = 1; i < numBuckets; i++){
        var cur = i * bucketSize;
        graphX.push(cur);

        var min = (i - 1) * bucketSize;
        graphY.push(sumFromTo(data, min, cur));
    }

    var last = (numBuckets - 1) * bucketSize;

    var rest = sumFromTo(data, last, 1000000000);
    graphX.push(last + bucketSize);
    graphY.push(rest);

    return {
        graphX: graphX,
        graphY: graphY
    };
}

$(document).ready(function(){

    data = Papa.parse(
        $("#datatable").html()
    ).data;

    // simple plot
    var graphX = [];
    var graphY = [];


    for(var i = 0; i < data.length; i++){
        var cur = data[i];
        var range = cur[RANGE_INDEX].replace(/,/g, '');
        var splits = range.split("-");

        var min = parseFloat(splits[0]);
        var max = parseFloat(splits[1]);

        cur.push(min);
        cur.push(max);

        var count = cur[COUNTS_INDEX].replace(/,/g, '');
        cur[COUNTS_INDEX] = parseInt(count);

        if(isNaN(max)){
            max = ">= 50 M";
        }else{
            max = "< " + max.round(0);
        }

        graphX.push(max);


        graphY.push(cur[COUNTS_INDEX]);

        var cleanPercent = parseFloat(cur[PERCENT_INDEX].replace('%', ''));

        if(cleanPercent < 6e-6){
            cleanPercent = "0.0000006";
        }

        cur[PERCENT_INDEX] = cleanPercent;


    }



    // Set the population
    $("#popsize").text(english(POPULATION));

    // Set the default income
    $("#income").val(DEFAULT_INCOME);

    function round(num){
        return Math.floor(num * 100) / 100;
    }

    function generatePeople(percent){
        // clear the bills
        $("#people").html("");

        var dark = Math.floor(percent);
        var light = 100 - dark;

        var count = 0;

        if(percent >= 0.1 && percent < 1){
            var img = $('<img src="stick_figure_partial.png" width="25">');
            img.appendTo('#people');
            light--;
            count++;
        }

        // add the number of images for the hourly rate.
        for(var i = 0; i < dark; i++){
            count++;
            var img = $('<img src="stick_figure_black.png" width="25">');
            img.appendTo('#people');

            if(count % 25 == 0){
                $("#people").append("<br>");
            }
        }

        for(var i = 0; i < light; i++){
            count++
            var img = $('<img src="stick_figure_white.png" width="25">');
            img.appendTo('#people');

            if(count % 25 == 0){
                $("#people").append("<br>");
            }

        }
    }

    function generateBills(rate){
        // clear the bills
        $("#bills").html("");

        $("#bills").append("<h3>$" + Math.floor(rate) + "/hour</h3>")

        if(rate > 2000){
            return;
        }

        // add the number of images for the hourly rate.
        for(var i = 0; i < Math.floor(rate); i++){
            var img = $('<img src="dollar.jpg" width="100">');
            img.appendTo('#bills');
        }
    }

    function generateDays(days){
        // clear the days
        $("#days").html("");

        var days = Math.floor(days);

        $("#days").append("<h3>" + days + " Days!</h3>");

        if(days > 1000){
            return;
        }

        // add the number of images for the hourly rate.
        for(var i = 0; i < days; i++){
            var img = $('<img src="day.png" width="40">');
            img.appendTo('#days');
        }
    }

    function generateHours(hours){

        // clear the hours
        $("#hours").html("");

        if(hours > 24){
            return;
        }

        var hours = Math.floor(hours);

        $("#hours").append("<h3>Just " + hours + " Hours!</h3>");



        // add the number of images for the hourly rate.
        for(var i = 0; i < hours; i++){
            var img = $('<img src="hour.png" width="40">');
            img.appendTo('#hours');
        }
    }

    function generateMins(hours){

        // clear the hours
        $("#minutes").html("");

        if(hours > 1){
            return;
        }

        var minutes = 60 * hours;

        minutes = Math.floor(minutes);

        $("#minutes").append("<h3>Just " + minutes + " Minutes!</h3>");



        // add the number of images for the hourly rate.
        for(var i = 0; i < minutes; i++){
            var img = $('<img src="minute.jpg" width="40">');
            img.appendTo('#minutes');
        }
    }


    function compute(income){
        // Default to 100 percent if less than all cutoffs.
        var percent = "0.0000006";

        for(var i = 0; i < data.length; i++){
            var cur = data[i];
            if(income >= cur[MIN_INDEX] && income <= cur[MAX_INDEX]){
                percent = cur[PERCENT_INDEX];
            }
        }

        if(income == 0){
            percent = 100;
        }

        // Set the percentile text
        $("#percentile").text(percent);
        $("#incomeText").text(toMoney(income,true));

        // Calculate and set the group size
        var groupsize = percent / 100.0 * POPULATION;


        $("#groupsize").text(english(groupsize));

        // Format the progress bar
        $("#percentbar").css('width', percent + '%');

        $("#percentbar2").css('width', (100 - percent) + '%');

        generatePeople(percent);

        // Set the size of the rest of the population
        var rest = english(POPULATION - groupsize);
        $("#restsize").text(rest);

        var hourlyRate = income / WORKING_HOURS;
        $("#hourly").text(toMoney(hourlyRate));
        generateBills(hourlyRate);

        $("#median").text(toMoney(MEDIAN_INCOME, true));
        var medianRate = toMoney(MEDIAN_INCOME / WORKING_HOURS);
        $("#medianrate").text(medianRate);

        var medianMultiple = income / MEDIAN_INCOME;
        $("#medianmultiple").text(medianMultiple.toFixed(5));

        var hoursToMakeMedian = WORKING_HOURS / medianMultiple;
        var daysToMakeMedian = hoursToMakeMedian / HOURS_PER_DAY;

        generateDays(daysToMakeMedian);
        generateHours(hoursToMakeMedian);
        generateMins(hoursToMakeMedian);

        var yearsToMakeMedian = 1 / medianMultiple;
        $("#medianhours").text(hoursToMakeMedian.round(4));
        $("#mediandays").text(daysToMakeMedian.round(4));
        $("#medianyears").text(yearsToMakeMedian.round(4));


        var fedMinIncome = FED_MIN_WAGE * WORKING_HOURS;
        var fedMinMultiple = income / fedMinIncome;
        var fedMinHours = income / FED_MIN_WAGE;
        var fedMinDays = fedMinHours / 8;
        var fedMinYearsToGet = fedMinDays / (DAYS_PER_WEEK * WEEKS_PER_YEAR);
        $("#fedminmultiple").text(fedMinMultiple.round(4));
        $("#fedminhours").text(fedMinHours.round(2));
        $("#fedmindays").text(fedMinDays.round(2));
        $("#fedminyears").text(fedMinYearsToGet.round(4));

        $("#poverty").text(toMoney(POVERTY_INCOME, true));
        $("#elite").text(toMoney(ELITE_INCOME, true));
        $("#billion").text(toMoney(BILLION_INCOME, true));
    }

    // When they enter a key, recalculate.
    $("#income").keyup(function(e){
        var val = $(this).val();
        val = val.replace(/,/g, '');
        val = val.replace('$', '');

        var amount = parseInt(val) || 0;
        compute(amount);
    });

    // quickly insert a value
    $(".quick-click").click(function(e){
        var val = $(this).attr('data-val');
        console.log(val);
        $("#income").val(val);
        var amount = parseInt(val) || 0;
        compute(amount);
    });

    // Calculate initially with the default values
    compute(DEFAULT_INCOME);

    var layout1 = {
      title: 'US Income Distribution (SSA Buckets)'
    };

    var graph1 = [{
      x: graphX,
      y: graphY,
      type: 'bar'
    }];

    Plotly.newPlot('myDiv', graph1, layout1);

    var layout2 = {
      title: 'US Income Distribution ($50k buckets)'
    };

    // Graph of 6 50k buckets
    var graphObj_50k = createGraphArrays(50000, 6);

    var graph2 = [{
      x: graphObj_50k.graphX,
      y: graphObj_50k.graphY,
      type: 'bar'
    }];

    Plotly.newPlot('myDiv2', graph2, layout2);


    // 10k bucket graphs
    var graphObj_10k = createGraphArrays(10000, 21);

    var layout3 = {
      title: 'US Income Distribution ($10k buckets)'
    };

    var graph3 = [{
      x: graphObj_10k.graphX,
      y: graphObj_10k.graphY,
      type: 'bar'
    }];

    Plotly.newPlot('myDiv3', graph3, layout3);


    // Graph of 50k buckets, all the way
    var graphObj_100k2 = createGraphArrays(100000, 500);

    // var x100 = [100000, 200000, 300000, 400000, 500000];

     x100 = [];
    for(var i = 0; i < 500; i++){
        x100.push(i * 100000);
    }

     y100 = [
        145130107,
        10161656,
        1605002,
        553507,
        260043
    ];

    var start = y100.length;
    for(var i = 0; i < 500 - start; i++){
        y100.push(0);
    }

    // 500,000.00 — 999,999.99 345,935
    // 1,000,000.00 — 1,499,999.99 65,548
    // 1,500,000.00 — 1,999,999.99 24,140
    // 2,000,000.00 — 2,499,999.99 12,137
    // 2,500,000.00 — 2,999,999.99 6,871
    // 3,000,000.00 — 3,499,999.99 4,799
    // 3,500,000.00 — 3,999,999.99 3,258
    // 4,000,000.00 — 4,499,999.99 2,353
    // 4,500,000.00 — 4,999,999.99 1,822
    // 5,000,000.00 — 9,999,999.99 6,468
    // 10,000,000.00 — 19,999,999.99   2,230
    // 20,000,000.00 — 49,999,999.99   776
    // 50,000,000.00 and over  134
    y100[10] = 345935;
    y100[15] = 65548;
    y100[20] = 24140;
    y100[25] = 12137;
    y100[30] = 6871;
    y100[35] = 4799;
    y100[40] = 3258;
    y100[45] = 2353;
    y100[50] = 1822;
    y100[100] = 6468;
    y100[200] = 2230;
    y100[300] = 776; // This is a 30M range
    y100[499] = 134;

    var graph4 = [{
      x: x100, //graphObj_100k2.graphX,
      y: y100, //graphObj_100k2.graphY,
      type: 'bar'
    }];


    Plotly.newPlot('myDiv4', graph4, {
        title: 'US Income Distribution ($100k buckets, full)'
    });

    // Graph of 100k buckets, truncated
    var graphObj_100k = createGraphArrays(100000, 6);

    var graph5 = [{
      x: graphObj_100k.graphX,
      y: graphObj_100k.graphY,
      type: 'bar'
    }];

    Plotly.newPlot('myDiv5', graph5, {
        title: 'US Income Distribution ($100k buckets)'
    });


    // Including billionaires.

    var x100_2 = [];
    for(var i = 0; i < 35000; i++){
        x100.push(i * 100000);
    }

    var y100_2 = [
        145130107,
        10161656,
        1605002,
        553507,
        260043
    ];

    var start = y100.length;
    for(var i = 0; i < 35000 - start; i++){
        y100.push(0);
    }

    y100[10] = 345935;
    y100[15] = 65548;
    y100[20] = 24140;
    y100[25] = 12137;
    y100[30] = 6871;
    y100[35] = 4799;
    y100[40] = 3258;
    y100[45] = 2353;
    y100[50] = 1822;
    y100[100] = 6468;
    y100[200] = 2230;
    y100[300] = 776; // This is a 30M range
    y100[499] = 134;

    y100[34999] = 25;

    var graph6 = [{
      x: x100, //graphObj_100k2.graphX,
      y: y100, //graphObj_100k2.graphY,
      type: 'bar'
    }];

    Plotly.newPlot('myDiv6', graph6, {
        title: 'US Income Distribution ($100k buckets, full scale)'
    });

    Plotly.newPlot('myDiv7', graph6, {
        title: 'US Income Distribution ($100k buckets, full scale)'
    });


});

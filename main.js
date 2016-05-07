
// This it the target population, in millions
var POPULATION = 158186786;

// This is the number of working hours.
var HOURS_PER_DAY = 8;
var DAYS_PER_WEEK = 5;
var WEEKS_PER_YEAR = 52;
var WORKING_HOURS = HOURS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_YEAR;

// Median income
var MEDIAN_INCOME = 28851;

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
    console.log("SUM FOR start=" + start + " to end=" + end);
    var sum = 0;
    for(var i = 0; i < data.length; i++){
        var cur = data[i];
        var min = cur[MIN_INDEX];
        var max = cur[MAX_INDEX];
        var str= "min= " + min + " max=" + max;

        if(start < min && max < end){
            sum += cur[COUNTS_INDEX];
            str += "COUNT";
        }

        console.log(str);

    }
    return sum;
}

$(document).ready(function(){

    data = Papa.parse(
        $("#datatable").html()
    ).data;
    console.log(data);

    // simple plot
    var graphX = [];
    var graphY = [];


    for(var i = 0; i < data.length; i++){
        var cur = data[i];
        console.log(cur);
        var range = cur[RANGE_INDEX].replace(/,/g, '');
        var splits = range.split("-");
        console.log(splits);

        var min = parseFloat(splits[0]);
        var max = parseFloat(splits[1]);
        console.log(min)
        console.log(max);

        cur.push(min);
        cur.push(max);

        var count = cur[COUNTS_INDEX].replace(/,/g, '');
        cur[COUNTS_INDEX] = parseInt(count);

        graphX.push("< " + max.round(0));
        graphY.push(cur[COUNTS_INDEX]);

        var cleanPercent = parseFloat(cur[PERCENT_INDEX].replace('%', ''));
        cleanPercent = cleanPercent.round(5);

        cur[PERCENT_INDEX] = cleanPercent;


    }



    // 50k bucket plot
     graphX2 = [];
     graphY2 = [];
    for(var i = 1; i < 5; i++){
        var cur = i * 50000;
        console.log(cur);
        graphX2.push(cur);

        var min = (i - 1) * 50000;
        graphY2.push(sumFromTo(data, min, cur));
    }


    // Set the population
    $("#popsize").text(english(POPULATION));

    // Set the default income
    $("#income").val(DEFAULT_INCOME);

    function round(num){
        return Math.floor(num * 100) / 100;
    }

    function compute(income){
        // Default to 100 percent if less than all cutoffs.
        var percent = 0.0001;

        for(var i = 0; i < data.length; i++){
            var cur = data[i];
            if(income >= cur[MIN_INDEX] && income <= cur[MAX_INDEX]){
                percent = cur[PERCENT_INDEX];
            }
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

        // Set the size of the rest of the population
        var rest = english(POPULATION - groupsize);
        $("#restsize").text(rest);

        var hourlyRate = income / WORKING_HOURS;
        $("#hourly").text(toMoney(hourlyRate));

        $("#median").text(toMoney(MEDIAN_INCOME, true));
        var medianRate = toMoney(MEDIAN_INCOME / WORKING_HOURS);
        $("#medianrate").text(medianRate);

        var medianMultiple = income / MEDIAN_INCOME;
        $("#medianmultiple").text(medianMultiple.toFixed(5));

        var hoursToMakeMedian = WORKING_HOURS / medianMultiple;
        var daysToMakeMedian = hoursToMakeMedian / HOURS_PER_DAY;
        var yearsToMakeMedian = 1 / medianMultiple;
        $("#medianhours").text(hoursToMakeMedian.round(4));
        $("#mediandays").text(daysToMakeMedian.round(4));
        $("#medianyears").text(yearsToMakeMedian.round(4));

        $("#poverty").text(toMoney(POVERTY_INCOME, true));
        $("#elite").text(toMoney(ELITE_INCOME, true));
        $("#billion").text(toMoney(BILLION_INCOME, true));
    }

    // When they enter a key, recalculate.
    $("#income").keyup(function(e){
        var val = $(this).val();
        val = val.replace(/,/g, '');

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

    var graph2 = [{
      x: graphX2,
      y: graphY2,
      type: 'bar'
    }];

    Plotly.newPlot('myDiv2', graph2, layout2);
});

var config = {
    apiKey: "AIzaSyBcbuLnSjJKm1uS6lLZs-hTLaC4i0ZdMf0",
    authDomain: "rps-game-b1780.firebaseapp.com",
    databaseURL: "https://rps-game-b1780.firebaseio.com",
    projectId: "rps-game-b1780",
    storageBucket: "rps-game-b1780.appspot.com",
    messagingSenderId: "144841931017"
};
firebase.initializeApp(config);
var idCounter = 0;
var uniqueId = ("minutes-away" + idCounter);
console.log(uniqueId);
var hogwartsTrain = {
    name: 'Hogwarts Express',
    destination: 'Castle',
    frequency: 10100,
    nextArrival: function() {
        return trainArrivalCalc(10100, "11:00");
    },
    minutesAway: function() {
        return trainMinutesTillCalc(10100, "11:00");
    },
}
var beanTownTrain = {
    name: 'The Bean Town Steamer',
    destination: 'Boston',
    frequency: 180,
    nextArrival: function() {
        return trainArrivalCalc(180, "1:40");
    },
    minutesAway: function() {
        return trainMinutesTillCalc(180, "1:40");
    }
}
var flyingScotsTrain = {
    name: 'Flying Scotsman',
    destination: 'Glascow',
    frequency: 60,
    nextArrival: function() {
        return trainArrivalCalc(60, "9:25");

    },
    minutesAway: function() {
        return trainMinutesTillCalc(60, "9:25");
    },
}
var database = firebase.database();
var trainNameList = [];
var trainData = [hogwartsTrain, beanTownTrain, flyingScotsTrain];
for (var i = 0; i < trainData.length; i++) {
    idCounter = "minutes-away" + i;
    $("table").append("<tr><td>" + trainData[i].name + "</td><td>" + trainData[i].destination + "</td><td>" + trainData[i].frequency + "</td><td id='next-train'>" + trainData[i].nextArrival() + "</td><td id=" + idCounter + ">" + trainData[i].minutesAway() + "</td></td>");
}
$("body").on("click", "#submit-button", function(e) {
    e.preventDefault();
    var nameVal = $("#a-train-name").val().trim();
    var destinationVal = $("#a-destination").val().trim();
    var firstTrainVal = $("#a-first-train").val().trim();
    var frequencyVal = $("#a-frequency").val().trim();
    // if the train name doesnt already exist run add this train data
    if (trainNameList.indexOf(nameVal) === -1) {
        idCounter++;
        // pushing new name to train list
        trainNameList.push(nameVal);
        // splitting name to isolate hour and minute
        var splitVal = firstTrainVal.split(":");
        //changing the input text into integers
        frequencyVal = parseInt(frequencyVal);
        splitVal[0] = parseInt(splitVal[0]);
        splitVal[1] = parseInt(splitVal[1]);
        // get the time from user input then subtract 1 year to make sure its before current time
        var timeNow = moment({ hour: splitVal[0], minute: splitVal[1] }).clone();
        timeNow.subtract(1, "year");
        // get the difference in time between now and the date given
        var diffTime = moment().diff(moment(timeNow), "minutes");
        // module out the remainder
        var remainder = diffTime % frequencyVal;
        var minutesTillTrain = frequencyVal - remainder;
        var nextTrain = moment().add(minutesTillTrain, "minutes");
        // pushing records to the database 
        database.ref().push({
            name: nameVal,
            destination: destinationVal,
            frequency: frequencyVal,
            firstTrainTime: nextTrain.format("hh:mm a"),
            minutesAway: minutesTillTrain
        });
        // pulling records from the database and repopulating the page on click, only updates when children are added
        database.ref().on("child_added", function(childsnapshot, prevChildKey) {
            $("table").append("<tr><td>" + childsnapshot.val().name + "</td><td>" + childsnapshot.val().destination + "</td><td>" + childsnapshot.val().frequency + "</td><td>" + childsnapshot.val().firstTrainTime + "</td><td id=" + uniqueId + ">" + childsnapshot.val().minutesAway + "</td></tr>");
        });
        $("input").empty();
    } else {
        alert("you already added a train with that name!");
    }
});
// my clock and updates the minutesaway every minute
function update() {
    $('#clock').html(moment().format('D. MMMM YYYY h:mm:ss a'));
    debugger;
    if (moment().format("ss") == "00") {
        $("#minutes-away0").html(hogwartsTrain.minutesAway());
        $("#minutes-away1").html(beanTownTrain.minutesAway());
        $("#minutes-away2").html(flyingScotsTrain.minutesAway());
    }
}
setInterval(update, 1000);

function trainArrivalCalc(frequency, startTime) {
    var converted = moment(startTime, "hh:mm").subtract(1, "year");
    var diffTime = moment().diff(moment(converted), "minutes");
    var remainder = diffTime % frequency;
    var minutesTillTrain = frequency - remainder;
    var nextTrain = moment().add(minutesTillTrain, "minutes");
    return nextTrain.format("hh:mm a");
}

function trainMinutesTillCalc(frequency, startTime) {
    var converted = moment(startTime, "hh:mm").subtract(1, "year");
    var diffTime = moment().diff(moment(converted), "minutes");
    var remainder = diffTime % frequency;
    var minutesTillTrain = frequency - remainder;
    return minutesTillTrain;
}
console.log(trainData[1].nextArrival(), trainData[1].minutesAway(), trainData[2].minutesAway());
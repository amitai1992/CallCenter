
function initSocket() {
    socket = io.connect();

    //to recive city names as written in the table + the topic of the call
    socket.on("updCityTopicTable", cityTopic => {
        var city = cityTopic.city.charAt(0).toUpperCase() + cityTopic.city.slice(1);
        var topic = cityTopic.topic.charAt(0).toUpperCase() + cityTopic.topic.slice(1);
        id = city + topic;
        document.getElementById(id).innerHTML++;
        document.getElementById("total" + topic).innerHTML++;
        document.getElementById("totalCalls").innerHTML++;



    });

    //to recive time of call (5 min agr), num of calls and avg time of relevant cells in 5 mins array
    socket.on("upd5minSeg", fiv5MinArr => {
        for(var i = 0; i < fiv5MinArr.length; i++){
            var hour = fiv5MinArr[i].hour;
            var id = hour + "-ActiveCalls";
            document.getElementById(id).innerHTML++;

        }
        for(var index = 0; index < fiv5MinArr.length; index++){
            var houravg = fiv5MinArr[index].hour;
            var watingT = fiv5MinArr[index].avgWaitingTime;
            var id2 = hour + "-Wating";
            document.getElementById(id2).innerHTML = watingT;

        }

    });

    //to recive new number of waiting calls in system (for graph)
    socket.on("updNumOfWaitingCallsRT", () => {
        // refresh chart line, notice that in the $ you need to add the chart id like i did below
        $("#chart").dxChart("refresh");
    });

    //AVG call time of calls in the last 10 mins - to update every round min
    socket.on("updAvgOfLast10Mins", (new10MinsData) => {

    });

    //number of calls by lang grpah
    socket.on("updCallersByLang", nNumOfCallers => {

    });

    //number of calls by topic graph
    socket.on("updCallersByTopic", nNumOfCallers => {

    });

    //grpah of active calls pre 5 min segment + waiting time split by 5 min segments
    socket.on("upd5minSeg", nNumOfCallers => {

    });



}

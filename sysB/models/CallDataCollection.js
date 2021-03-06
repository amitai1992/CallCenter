const redisHandler = require("../utils/redisHandler");
const CallData = require("./CallData");

let _collection;

module.exports = class CallDataCollection {

    static init() {
        _collection = [];
    }

    static copyRedisOutputToCollection(output) {
        output.forEach((elem) => {
            const callData = new CallData(elem);
            _collection.push(callData);
        });
    }

    static getCallsFromRedis() {
        return new Promise((result, reject) => {
            redisHandler.getData("callData").then((collectionRetrieved, err) => {
                if (err) {
                    reject(err);
                }
                const tempCollection = JSON.parse(JSON.stringify(collectionRetrieved));
                tempCollection.forEach(elem => _collection.push(new CallData(elem)));
                result(_collection);
            });
        });
    }

    static addCallDataInstance(callData) {
        _collection.push(callData);
    }


    static getAVGtimeOfCallLast10Min() {
        try {
            return (_collection
                .filter(callData => this.isLessThan10Minutes(callData))
                .map(callData => callData["total call time"])
                .reduce((accumulator, currentValue) => accumulator + currentValue)
                / _collection.length);
        }
        catch (e) {
            if (e.message === "Reduce of empty array with no initial value") {
                return [];
            }
            else throw new Error(e);
        }
    }

    static isLessThan10Minutes(callDataElem) {
        const date = Date.now();
        const dateTimeFormat = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "numeric", hour12: false });
        let [{ value: hour }, , { value: minute }] = dateTimeFormat.formatToParts(date);
        hour = parseInt(hour);
        minute = parseInt(minute);
        const [callHour, callMinute] = callDataElem["time recived"].split(":");
        return ((hour - callHour === 0) && (minute - callMinute <= 10));

    }

    static getCollection() {
        return _collection;
    }

    static groupByCity() {
        return _groupBy("caller city");
    }

    static groupByTopic() {
        return _groupBy("call topic");
    }

    static groupByType() {
        return _groupBy("type of call");
    }

    static groupByLang() {
        return _groupBy("caller language");
    }

    static groupByCityTopic() {
        const allCitys = ["Jerusalem", "Naaria", "Haifa",
            "Tel Aviv","Ashdod","Ashkelon","Beer Sheva"];
        const toRet = [];
        const listOfCitys = this.groupByCity();
        for (const city in listOfCitys) {
            const index = allCitys.indexOf(city);
            allCitys.splice(index, 1);
        }
        for (const city of allCitys) {
            listOfCitys[city] = 0;
        }
        let index = 0;
        for (const city in listOfCitys) {
            const thisCityTopicList = _collection
                .filter(elem => elem["caller city"] === city)
                .map(elem => elem["call topic"])
                .reduce((running, currentValue) =>(running[currentValue] ?
                    running[currentValue] = running[currentValue] + 1 : running[currentValue] = 1, running), {});
            
            toRet[index] = ({
                city: city,
                topics: [{ name: "Medical", numOfCalls: 0 }, { name: "Drugs", numOfCalls: 0 }, { name: "Food", numOfCalls: 0 }, { name: "Water", numOfCalls: 0 }, { name: "Shelter", numOfCalls: 0 }, { name: "Information", numOfCalls: 0 }, { name: "Evacuation", numOfCalls: 0 }]
            });

            for (let i = 0; i < toRet[index].topics.length; i++) {
                if (thisCityTopicList[toRet[index].topics[i].name]) {
                    toRet[index].topics[i].numOfCalls = thisCityTopicList[toRet[index].topics[i].name];
                }
            }
            index++;
        }
        return toRet;
    }

};

const _groupBy = (valToGroupBy) => {
    return _isEmpty() ? [] : _collection.map(elem => elem[valToGroupBy]).reduce((running, valToGroupBy) =>
        (running[valToGroupBy] ?
            running[valToGroupBy] = running[valToGroupBy] + 1 : running[valToGroupBy] = 1, running), {});
};

const _isEmpty = () => {
    return _collection.length === 0 ? true : false;
};

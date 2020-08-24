const redisHandler = require("../utils/redisHandler");
const CallData = require("./CallData");

let _collection;
let _redisClient;

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
    // static groupByCity() {
    //     return CallDataCollection.isEmpty() ? [] : _collection.map(elem => elem["caller city"]).reduce((running, callerCity) =>
    //         (running[callerCity] ?
    //             running[callerCity] = running[callerCity] + 1 : running[callerCity] = 1, running), {});
    // }

    // static groupByTopic() {
    //     return CallDataCollection.isEmpty() ? [] : _collection.map(elem => elem["call topic"]).reduce((running, callerCity) =>
    //         (running[callerCity] ?
    //             running[callerCity] = running[callerCity] + 1 : running[callerCity] = 1, running), {});
    // }

    // static groupByType() {
    //     return CallDataCollection.isEmpty() ? [] : _collection.map(elem => elem["type of call"]).reduce((running, callerCity) =>
    //         (running[callerCity] ?
    //             running[callerCity] = running[callerCity] + 1 : running[callerCity] = 1, running), {});
    // }

    // static groupByLang() {
    //     return CallDataCollection.isEmpty() ? [] : _collection.map(elem => elem["caller language"]).reduce((running, callerCity) =>
    //         (running[callerCity] ?
    //             running[callerCity] = running[callerCity] + 1 : running[callerCity] = 1, running), {});
    // }


    static getCollection() {
        return _collection;
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

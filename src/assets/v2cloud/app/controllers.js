'use strict';

app.filter('currencyFormat', function () {
    return function (input, decimals) {
        //var out = $filter(input, decimals)
        var out = decimals.toString() + " --> " + input;
        return out;
    };
})


app.controller('PerformanceDataController', ['$scope', 'backendHubProxy', 'infoService', '$location', '$window',
    function ($scope, backendHubProxy, infoService, $location, $window) {
        /*var knownIntervals = [{ "Caption": "0.001", "TimeSpan": "00:01:00", "Name": "1 min" }, { "Caption": "0.003", "TimeSpan": "00:03:00", "Name": "3 min" }, { "Caption": "0.005", "TimeSpan": "00:05:00", "Name": "5 min" }, { "Caption": "0.01", "TimeSpan": "00:15:00", "Name": "15 min" }, { "Caption": "0.03", "TimeSpan": "00:30:00", "Name": "30 min" }, { "Caption": "0.04", "TimeSpan": "00:45:00", "Name": "45 min" }, { "Caption": "0.1", "TimeSpan": "01:00:00", "Name": "1 hr" }, { "Caption": "0.2", "TimeSpan": "02:00:00", "Name": "2 hr" }, { "Caption": "0.4", "TimeSpan": "04:00:00", "Name": "4 hr" }, { "Caption": "0.5", "TimeSpan": "05:00:00", "Name": "5 hr" }, { "Caption": "0.6", "TimeSpan": "06:00:00", "Name": "6 hr" }, { "Caption": "0.9", "TimeSpan": "09:00:00", "Name": "9 hr" }, { "Caption": "0.12", "TimeSpan": "12:00:00", "Name": "12 hr" }, { "Caption": "1", "TimeSpan": "1.00:00:00", "Name": "1 days" }, { "Caption": "2", "TimeSpan": "2.00:00:00", "Name": "2 days" }, { "Caption": "3", "TimeSpan": "3.00:00:00", "Name": "3 days" }, { "Caption": "7", "TimeSpan": "7.00:00:00", "Name": "7 days" }, { "Caption": "14", "TimeSpan": "14.00:00:00", "Name": "14 days" }, { "Caption": "30", "TimeSpan": "30.00:00:00", "Name": "30 days" }, { "Caption": "45", "TimeSpan": "45.00:00:00", "Name": "45 days" }, { "Caption": "60", "TimeSpan": "60.00:00:00", "Name": "60 days" }, { "Caption": "90", "TimeSpan": "90.00:00:00", "Name": "90 days" }];*/
        /*var knownIntervals = [{ "Caption": "0.001", "TimeSpan": "00:01:00", "Name": "1 min" }, { "Caption": "0.003", "TimeSpan": "00:03:00", "Name": "3 min" }, { "Caption": "0.005", "TimeSpan": "00:05:00", "Name": "5 min" }, { "Caption": "0.01", "TimeSpan": "00:15:00", "Name": "15 min" }, { "Caption": "0.04", "TimeSpan": "00:45:00", "Name": "45 min" }, { "Caption": "0.1", "TimeSpan": "01:00:00", "Name": "1 hr" }, { "Caption": "0.2", "TimeSpan": "02:00:00", "Name": "2 hr" }, { "Caption": "0.4", "TimeSpan": "04:00:00", "Name": "4 hr" }, { "Caption": "0.6", "TimeSpan": "06:00:00", "Name": "6 hr" }, { "Caption": "0.9", "TimeSpan": "09:00:00", "Name": "9 hr" }, { "Caption": "0.12", "TimeSpan": "12:00:00", "Name": "12 hr" }, { "Caption": "1", "TimeSpan": "1.00:00:00", "Name": "1 day" }, { "Caption": "2", "TimeSpan": "2.00:00:00", "Name": "2 days" }, { "Caption": "3", "TimeSpan": "3.00:00:00", "Name": "3 days" }, { "Caption": "7", "TimeSpan": "7.00:00:00", "Name": "7 days" }, { "Caption": "14", "TimeSpan": "14.00:00:00", "Name": "14 days" }, { "Caption": "30", "TimeSpan": "30.00:00:00", "Name": "30 days" }, { "Caption": "45", "TimeSpan": "45.00:00:00", "Name": "45 days" }, { "Caption": "60", "TimeSpan": "60.00:00:00", "Name": "60 days" }, { "Caption": "90", "TimeSpan": "90.00:00:00", "Name": "90 days" }];*/
        var knownIntervals = [{ "Caption": "0.001", "TimeSpan": "00:01:00", "Name": "1 min", "isVisible":false }, { "Caption": "0.003", "TimeSpan": "00:03:00", "Name": "3 min", "isVisible":false }, { "Caption": "0.005", "TimeSpan": "00:05:00", "Name": "5 min", "isVisible":false }, { "Caption": "0.01", "TimeSpan": "00:15:00", "Name": "15 min", "isVisible":false }, { "Caption": "0.04", "TimeSpan": "00:45:00", "Name": "45 min", "isVisible":false }, { "Caption": "0.1", "TimeSpan": "01:00:00", "Name": "1 hr", "isVisible":true }, { "Caption": "0.2", "TimeSpan": "02:00:00", "Name": "2 hr", "isVisible":false }, { "Caption": "0.4", "TimeSpan": "04:00:00", "Name": "4 hr", "isVisible":true }, { "Caption": "0.6", "TimeSpan": "06:00:00", "Name": "6 hr", "isVisible":false }, { "Caption": "0.9", "TimeSpan": "09:00:00", "Name": "9 hr", "isVisible":false }, { "Caption": "0.12", "TimeSpan": "12:00:00", "Name": "12 hr", "isVisible":false }, { "Caption": "1", "TimeSpan": "1.00:00:00", "Name": "1 day", "isVisible":true }, { "Caption": "2", "TimeSpan": "2.00:00:00", "Name": "2 days", "isVisible":true }, { "Caption": "3", "TimeSpan": "3.00:00:00", "Name": "3 days", "isVisible":false}, { "Caption": "7", "TimeSpan": "7.00:00:00", "Name": "7 days", "isVisible":true }, { "Caption": "14", "TimeSpan": "14.00:00:00", "Name": "14 days", "isVisible":true }, { "Caption": "30", "TimeSpan": "30.00:00:00", "Name": "30 days", "isVisible":true }, { "Caption": "45", "TimeSpan": "45.00:00:00", "Name": "45 days", "isVisible":false }, { "Caption": "60", "TimeSpan": "60.00:00:00", "Name": "60 days", "isVisible":true }, { "Caption": "90", "TimeSpan": "90.00:00:00", "Name": "90 days", "isVisible":true }];
    

        $scope.resistanceData = [];
        $scope.lastTradePrice = 0.0;
        $scope.priceTick = { lastTradePrice: 0.0, prevLastTradePrice: 0.0, lastTradePriceFormatted: '-', prevLastTradePriceFormatted: '-' };
        $scope.pairs = [];
        $scope.selectedPair = null;
        $scope.currentPair = null;
        $scope.decimals = 2;
        $scope.selectedInterval = knownIntervals[8];
        $scope.currentData = {};
        $scope.d = null;
        $scope.positiveKeys = ['7', '6', '5', '4', '3', '2', '1'];
        $scope.negativeKeys = ['-1', '-2', '-3', '-4', '-5', '-6', '-7'];

        var isFirstLoad = true;
        var lastTickData = null;
        var connectedPair = {};

        function getParameterByName(url, name) {
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }

        var connectToHub = function (exchange, symbol) {

            $scope.resistanceData = [];
            $scope.lastTradePrice = 0.0;
            $scope.priceTick = { lastTradePrice: 0.0, prevLastTradePrice: 0.0, lastTradePriceFormatted: '-', prevLastTradePriceFormatted: '-' };
            $scope.currentData = {};
            $scope.d = null;

            console.log('trying to connect to service')
            var selectedPair = $scope.selectedPair;
            connectedPair = $scope.selectedPair;

            var performanceDataHub = backendHubProxy(backendHubProxy.defaultServer, 'TradeHub', selectedPair.Exchange, selectedPair.Symbol);

            //Math.log10(1 / selectedPair.Precision); log10 is not supported in IE
            if (selectedPair.Precision == 0)
                $scope.decimals = 0;
            else
                $scope.decimals = Math.round(Math.log(1 / selectedPair.Precision) / Math.LN10);

            isFirstLoad = true;

            console.log('connected to service')

            performanceDataHub.on('ProcessMarketTick', function (data) {
                if ($scope.resistanceData.length == 0)
                    return;
                console.log('ProcessMarketTick')

                var lastTradePriceFormatted = formatPrice(data.LastTradePrice);
                if ($scope.priceTick.lastTradePriceFormatted != lastTradePriceFormatted) {
                    $scope.priceTick.prevLastTradePrice = $scope.priceTick.lastTradePrice;
                    $scope.priceTick.prevLastTradePriceFormatted = $scope.priceTick.lastTradePriceFormatted;
                }
                $scope.priceTick.lastTradePriceFormatted = lastTradePriceFormatted;
                $scope.priceTick.lastTradePrice = data.LastTradePrice;
                $scope.lastTradePrice = lastTradePriceFormatted;

                lastTickData = data;

                populateFromTickData($scope.resistanceData, data);
                updateResistanceLevels();
                console.log('done ProcessMarketTick')
            });

            performanceDataHub.on('ProcessResistance', function (data) {
                console.log('ProcessResistance')

                processResistance(data);

                populateFromTickData($scope.resistanceData, lastTickData);

                updateResistanceLevels();

                $scope.d = $scope.currentData;

                //if (isFirstLoad) {
                //    isFirstLoad = false;
                //    setTimeout(initLayout, 0);
                //}
                console.log('done ProcessResistance')
            });
            console.log('Done connection')
        };

        function updateResistanceLevel(rdi, sign) {
            var lastTradePrice = $scope.priceTick.lastTradePrice;
            var levelFound = false;

            for (var k = 1; k <= 7; k++) {
                var ks = (k * sign).toString();
                if (sign == 1)
                    rdi.Data[ks].IsPriceInRange = (lastTradePrice <= rdi.Data[ks].FullValue && rdi.Data[ks].FullValue > 0) || k == 7;
                else
                    rdi.Data[ks].IsPriceInRange = (lastTradePrice >= rdi.Data[ks].FullValue && rdi.Data[ks].FullValue > 0) || k == 7;

                rdi.Data[ks].IsCurrent = false;
                if (rdi.Data[ks].IsPriceInRange && !levelFound) {
                    levelFound = true;
                    rdi.Data[ks].IsCurrent = true;
                }
            }
        };

        function updateResistanceLevels() {
            if (!$scope.currentData)
                return;

            var rdi = $scope.currentData;

            updateResistanceLevel(rdi, 1);
            updateResistanceLevel(rdi, -1);
        };

        function processResistance(data) {
            var rd = $scope.resistanceData;

            var values = data.Values;
            var hits = data.Hits;
            var lastTradePrice = $scope.priceTick.lastTradePrice;

            for (var i = 0; i < knownIntervals.length; i++) {
                var rdi = rd[i];
                //if (rdi)
                //    rdi.PrevData = null;
                if (!rdi) {
                    rdi = {
                        Idx: i, Interval: knownIntervals[i], IntervalName: knownIntervals[i].Name, isVisible: knownIntervals[i].isVisible, Data: {}, EMAs: {}
                    };
                    rd[i] = rdi;
                }

                if (rdi.Interval == $scope.selectedInterval)
                    $scope.currentData = rdi;

                for (var k = 1; k <= 7; k++) {
                    var keyPositive = knownIntervals[i].Caption + "@" + k;
                    var keyNegative = knownIntervals[i].Caption + "@" + (-k);

                    rdi.Data[k.toString()] = {
                        Value: formatPrice(values[keyPositive]),
                        FullValue: values[keyPositive],
                        IsPriceInRange: lastTradePrice <= values[keyPositive] || k == 7
                    }

                    rdi.Data[(-k).toString()] = {
                        Value: formatPrice(values[keyNegative]),
                        FullValue: values[keyNegative],
                        IsPriceInRange: lastTradePrice >= values[keyNegative] || k == 7
                    }

                    if (k > 1) {
                        rdi.Data[k.toString()].Hits = hits[keyPositive];
                        rdi.Data[(-k).toString()].Hits = hits[keyNegative];
                    }
                    else {
                        rdi.Data[k.toString()].Hits = 0;
                        rdi.Data[(-k).toString()].Hits = 0;
                    }
                }
                var indicators = data.IndicatorResults;
                if (indicators) {
                    var emas = indicators.EMAValues;
                    if (emas) {
                        for (var emaParam in emas) {
                            rdi.EMAs[emaParam] = emas[emaParam][knownIntervals[i].TimeSpan];
                        }
                    }
                }
            }
        }




        function formatPrice(val) {
            var v2 = val;
            if (connectedPair.Symbol == "TOP20USD")
                v2 = Math.round(val / 1000000, 2);
            else
                v2 = val;
            return formatMoney(v2, $scope.decimals);
        };


        function formatMoney(n, c, d, t) {
            var c = isNaN(c = Math.abs(c)) ? 2 : c,
                d = d == undefined ? "." : d,
                t = t == undefined ? "," : t,
                s = n < 0 ? "-" : "",
                i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
                j = (j = i.length) > 3 ? j % 3 : 0;

            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        };

        function processLevelTouchDate(rdi, lti, k) {
            var d = Date.parse(lti[k].Date);
            if (d > -10000) {
                var ageSeconds = (Date.now() - d) / 1000;
                rdi.Data[k].Count = lti[k].Count;
                rdi.Data[k].Age = formatTimeSpan(ageSeconds);
            }
        }

        function processLevelTouchDates(rdi, resLevelsTouchDates) {
            if (!resLevelsTouchDates)
                return;

            var lti = resLevelsTouchDates[rdi.Interval.TimeSpan];
            if (lti) {

                for (var k = 1; k <= 7; k++) {
                    processLevelTouchDate(rdi, lti, k);
                }
                for (var k = -7; k <= -1; k++) {
                    processLevelTouchDate(rdi, lti, k);
                }

                var d = Date.parse(lti[100].Date);
                var ageSeconds = (Date.now() - d) / 1000;
                rdi.Breakout = {
                    Count: lti[100].Count,
                    Age: formatTimeSpan(ageSeconds)
                };

                d = Date.parse(lti[-100].Date);
                ageSeconds = (Date.now() - d) / 1000;
                rdi.Breakdown = {
                    Count: lti[-100].Count,
                    Age: formatTimeSpan(ageSeconds)
                };
            }
        };

        function processSpeedometers(rdi, speedometers) {
            if (!speedometers)
                return;
            var curVal = speedometers.Speedometers[rdi.Interval.TimeSpan];
            if (!curVal)
                return;
            if (!rdi.Speedometer)
                rdi.Speedometer = { PrevData: {} };

            rdi.Speedometer.Score = curVal.Score;
            var str = "";
            curVal.Details.forEach(function (item, i, arr) {
                str += item.Param + "=" + item.Value + " Score=" + item.Score + "\n";
            });
            rdi.Speedometer.DetailsString = str;

            if (speedometers.PrevPeriodSpeedometers && Object.keys(speedometers.PrevPeriodSpeedometers).length > 0) {
                var val = speedometers.PrevPeriodSpeedometers[rdi.Interval.TimeSpan];
                str = "";
                curVal.Details.forEach(function (item, i, arr) {
                    str += item.Param + "=" + item.Value + " Score=" + item.Score + "\n";
                });

                rdi.Speedometer.PrevData.Score = val.Score;
                rdi.Speedometer.PrevData.DetailsString = str;
            }
        };

        function processPositionPercents(rdi, positionPercents) {
            if (!positionPercents)
                return;
            var curVal = positionPercents[rdi.Interval.TimeSpan];
            if (curVal) {
                var tmpPP = curVal * 100;
                if (rdi.PositionPercent && rdi.PositionPercent != tmpPP)
                    rdi.PrevPositionPercent = rdi.PositionPercent;
                rdi.PositionPercent = tmpPP;
                if (!rdi.PrevPositionPercent)
                    rdi.PrevPositionPercent = rdi.PositionPercent;
            }
        };

        function populateFromTickData(resistanceData, tickData) {
            if (!tickData)
                return;
            if (resistanceData.length == 0)
                return;

            var data = tickData;

            var resLevelsTouchDates = data.ResistanceTick && data.ResistanceTick.LevelTouchTimes;
            //if (resLevelsTouchDates)
            //    return;

            var rd = resistanceData;
            for (var i = 0; i < rd.length; i++) {
                var rdi = rd[i];

                processLevelTouchDates(rdi, resLevelsTouchDates);

                processSpeedometers(rdi, data.ResistanceTick.Speedometers);

                var avgIntervals = data.ResistanceTick.AvgIntData;
                if (avgIntervals) {
                    var curVal = avgIntervals[rdi.Interval.Caption];
                    if (curVal) {
                        rdi.AvgIntData = curVal;
                    }
                }

                processPositionPercents(rdi, data.ResistanceTick.PositionPercents);

                //if (!rdi.data[100]) {
                //    rdi.data[100] = {};
                //    rdi.data[-100] = {};
                //}

                //var d = Date.parse(resLevelsTouchDates[rdi.Interval.TimeSpan][100].Date);
                //if (d > -10000) {
                //    var ageSeconds = (Date.now() - d) / 1000;
                //    rdi.Data[100].Count = lti[100].Count;
                //    rdi.Data[100].Age = formatTimeSpan(ageSeconds);
                //}
            }
        };

        function compareByDisplayName(a, b) {
            var str1 = formatPairImp(a);
            var str2 = formatPairImp(b);
            return str1.localeCompare(str2);
        }

        function compareByUSDT(a, b) {
            if (a.Symbol.indexOf('USD') > -1)
                return -1;
            if (b.Symbol.indexOf('USD') > -1)
                return 1;

            return a.Symbol.localeCompare(b.Symbol);
        }

        function formatTimeSpan(ts) {
            if (ts < 1)
                return 'now';
            if (ts < 60)
                return Math.floor(ts) + 's'
            if (ts < 60 * 60)
                return Math.floor(ts / 60) + 'm'
            if (ts < 24 * 60 * 60)
                return Math.floor(ts / 60 / 60) + 'm'
            else
                return Math.floor(ts / 60 / 60 / 27) + 'd'
        }

        var loadPairs = function () {
            infoService.getPairs()
                .then(function successCallback(response) {
                    var res = response.data;
                    res.sort(compareByDisplayName);

                    var curId = getParameterByName($location.$$absUrl, "currencyId");
                    if (curId) {
                        res = res.filter(x => x.BaseAssetCurrencyId == curId);
                    }

                    res.sort(compareByUSDT);

                    $scope.pairs = res;
                    if (res.length < 5 && res.length > 0) {
                        $scope.selectedPair = res[0];
                        connectToHub();
                    }
                }, function errorCallback(response) {
                    console.log("Unable to perform get request");
                });
            //$http.get("http://websocket.rekdeck.com/trader.web/InfoService.svc/GetValidCalculators")
            //    .then(function successCallback(response) {
            //        var res = response.data;
            //        res.sort(compareByDisplayName);
            //        $scope.pairs = res;
            //    }, function errorCallback(response) {
            //        console.log("Unable to perform get request");
            //    });
        };

        var selectInterval = function (interval) {
            var rd = $scope.resistanceData;
            $scope.selectedInterval = interval;
            if ($scope.resistanceData.length > 0) {
                $scope.currentData = $scope.resistanceData[interval.Idx];
                for (var i = 0; i < rd.length; i++) {
                    if (rd[i].Interval == $scope.selectedInterval) {
                        $scope.currentData = rd[i];
                        $scope.d = rd[i];
                        updateResistanceLevels();
                        break;
                    }
                }
            }
        }

        $scope.selectInterval = function (interval) {
            selectInterval(interval);
        }

        function formatPairImp(pair) {
            /*return pair.Symbol + "@" + pair.Exchange;*/
            return pair.Symbol;
        }

        $scope.formatPair = function (pair) {
            return formatPairImp(pair);
        }

        $scope.loadPairs = function () {
            loadPairs();
        }

        $scope.connectToHub = function () {
            connectToHub();
        }
        $scope.selectPair = function (pair) {
            $scope.selectedPair = pair;
            connectToHub();
        }

        var curId = getParameterByName($location.$$absUrl, "currencyId");
        if (!curId) {
            $window.location.href = 'topcoins.html';
        }
        loadPairs();
    }
]);

app.controller('PairsListController', ['$scope', 'infoService', '$interval',
    function ($scope, infoService, $interval) {

        $scope.topCoins = [];
        var pairs = [];

        $interval(function () {
            loadTopCoins();
        }, 30000);

        function formatPrice(val) {
            var v2 = val;
            var decimals = 2;
            if (val > 100000) {
                v2 = Math.round(val / 1000000, 2);
                decimals = 0;
            }
            if (val < 10)
                decimals = 4;

            return formatMoney(v2, decimals);
        };

        function formatMoney(n, c, d, t) {
            var c = isNaN(c = Math.abs(c)) ? 2 : c,
                d = d == undefined ? "." : d,
                t = t == undefined ? "," : t,
                s = n < 0 ? "-" : "",
                i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
                j = (j = i.length) > 3 ? j % 3 : 0;

            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        };

        function loadTopCoins() {
            infoService.getTopCoins()
                .then(function successCallback(response) {
                    var res = response.data;
                    for (var i = 0; i < res.length; i++) {
                        res[i].PriceUSD = formatPrice(res[i].PriceUSD);
                    }

                    $scope.topCoins = res;
                }, function errorCallback(response) {
                    console.log("Unable to perform get request");
                });
        };

        function loadPairs() {
            infoService.getPairs()
                .then(function successCallback(response) {
                    var res = response.data;
                    pairs = res;
                }, function errorCallback(response) {
                    console.log("Unable to perform get request");
                });
        };

        $scope.selectCoin = function (coin) {
            var validPairs = pairs.filter(x => x.BaseAssetCurrencyId == coin.CurrencyId);
            console.log(validPairs);
        }

        loadTopCoins();
        loadPairs();
    }
]);

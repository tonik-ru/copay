'use strict';

app.factory('backendHubProxy', ['$rootScope', 'backendServerUrl',
    function ($rootScope, backendServerUrl) {

        var globalConnection = null;
        function backendFactory(serverUrl, hubName, exchange, symbol) {
            if (globalConnection)
                globalConnection.hub.stop();

            $.connection.hub.url = backendServerUrl + '/signalr';
            var connection = $.connection;
            globalConnection = connection;
            //var connection = $.hubConnection(backendServerUrl);
            //var proxy = connection.createHubProxy(hubName);
            var proxy = connection.tradeHub;

            proxy.registerCallback = function () {
            };
            proxy.client.pingClient = function () {
                view.functions.processPing();
            };

            //proxy.client.processResistance = function (res) {
            //    console.log("resistance");
            //};

            connection.hub.start().done(function () {
                proxy.server.subscribeToMarketTicks({ Exchange: exchange, Symbol: symbol, RowsCount: 10, Aggregation: 0.01, ResistanceFactor: 0.0, WallLinesCount: 5, })
                    .done(function () {
                        console.log(Date().toString() + " Subscribed");
                    });

            });

            return {
                on: function (eventName, callback) {
                    proxy.on(eventName, function (result) {
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                },
                invoke: function (methodName, callback) {
                    proxy.invoke(methodName)
                        .done(function (result) {
                            $rootScope.$apply(function () {
                                if (callback) {
                                    callback(result);
                                }
                            });
                        });
                }
            };
        };

        return backendFactory;
    }]);

app.service('infoService', ['$rootScope', 'backendServerUrl', '$http',
    function ($rootScope, backendServerUrl, $http) {

        this.getPairs = function () {
            return $http.get(backendServerUrl + "/InfoService.svc/GetValidCalculators");
        };

        function appendTransform(defaults, transform) {

            // We can't guarantee that the default transformation is an array
            defaults = angular.isArray(defaults) ? defaults : [defaults];

            // Append the new transformation to the defaults
            return defaults.concat(transform);
        }

        this.getTopCoins = function () {
            return $http.get(backendServerUrl + "/InfoService.svc/GetTopCoins", {
                transformResponse: appendTransform($http.defaults.transformResponse, function (r) {
                    console.log(r);
                    var idx = 1;
                    r.forEach(function (x) {
                        if (x.Symbol != "TOP20") {
                            x.Position = idx;
                            idx = idx + 1;
                        }
                        x.IsIncreasing = x.PercentChange24h > 0;

                    })
                    return r;
                })
            });
        };
    }]);


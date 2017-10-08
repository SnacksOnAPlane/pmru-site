var mod = angular.module('PRMU', []);

var CITIES = "Adjuntas,Aguada,Aguadilla,Aguas Buenas,Aibonito,Añasco,Arecibo,Arroyo,Barceloneta,Barranquitas,Bayamon,Cabo Rojo,Caguas,Camuy,Canóvanas,Carolina,Cataño,Cayey,Ceiba,Ciales,Cidra,Coamo,Comerío,Corozal,Culebra,Dorado,Fajardo,Florida,Guayama,Guayanilla,Guaynabo,Gurabo,Guánica,Hatillo,Hormigueros,Humacao,Isabela,Isla Verde,Jayuya,Juana Díaz,Juncos,Lajas,Lares,Las Marías,Las Piedras,Luquillo,Loiza,Manati,Maricao,Maunabo,Mayagüez,Moca,Morovis,Naguabo,Naranjito,Orocovis,Patillas,Peñuelas,Ponce,Quebradillas,Rincón,Rio Grande,Sabana Grande,Salinas,San Germán,San Juan,San Lorenzo,San Sebastián,Santa Isabel,Toa Alta,Toa Baja,Trujillo Alto,Utuado,Vega Alta,Vega Baja,Villalba,Yabucoa,Yauco".split(',');

mod.controller('MainController', ['$scope','$http','$sce','$location', function($scope, $http, $sce, $location) {
  $scope.cities = CITIES;

  $scope.selectedCityChanged = function() {
    if ($scope.selectedCity) {
      $location.search('city', $scope.selectedCity);
    }
  };

  var city = $location.search().city;
  if (city) {
    $scope.selectedCity = city;
  }
  }]);
  
mod.directive("cityInfo", function() {
  return {
    templateUrl: 'cityInfo.html',
    replace: true,
    scope: {
      city: "="
    },

    controller: ['$scope', '$http', '$sce', function($scope, $http, $sce) {
      $scope.loading = false;

      $scope.$watch('city', fetchDataForCity);

      $scope.parseTime = function(time_str) {
        return new Date(time_str).toString();
      };

      $scope.downloadData = function() {
        console.log("downloading...");
        var lines = [];
        for (var i = 0; i < $scope.entries.length; i++) {
          var entry = $scope.entries[i];
          lines.push(entry.link + "\n" + entry.time + "\n" + entry.message + "\n\n-----\n");
        }
				var blob = new Blob(lines, {type: "text/plain;charset=utf-8"});
				saveAs(blob, "prmu-" + $scope.city + ".txt");
      }

      function dateComparator(i1, i2) {
        var d1 = Date.parse(i1.time);
        var d2 = Date.parse(i2.time);
        if (d1 > d2) {
          return -1;
        } else {
          return 1;
        }
      };

      function populateCurrent(data) {
        var tempEntries = [];
        $scope.cityTitle = data.data.feed.title['$t'];
        for (var i in data.data.feed.entry) {
          tempEntries.push(sanitizeEntry(data.data.feed.entry[i]));
        }
        $scope.loading = false;
        $scope.entries = tempEntries.sort(dateComparator);
      }

      function sanitizeEntry(entry) {
        // basically we just want the fields that start with gsx$, and only their $t vals
        var retme = {};
        for (var k in entry) {
          var v = entry[k];
          if (k.startsWith("gsx$")) {
            retme[k.substring(4)] = v['$t'];
          }
        }
        return retme;
      }

      function fetchDataForCity() {
        // index 1 is test
        var cityId = CITIES.indexOf($scope.city) + 2;
        if (cityId > 1) {
          $scope.loading = true;
          $scope.entries = [];
          var url = "https://spreadsheets.google.com/feeds/list/1pcBR6InPnOYhzC-EdEJv0c4FySZajSDZt5DeUDhGzhc/" + cityId + "/public/values?alt=json-in-script";
          url = $sce.trustAsResourceUrl(url);

          $http.jsonp(url, { jsonpCallbackParam: 'callback' }).then(populateCurrent);
        }
      }
    }]
  }
});

/**
 * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
 * © 2011 Colin Snover <http://zetafleet.com>
 * Released under MIT license.
 */
(function (Date, undefined) {
    var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
    Date.parse = function (date) {
        var timestamp, struct, minutesOffset = 0;

        // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
        // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
        // implementations could be faster
        //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
        if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
            // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
            for (var i = 0, k; (k = numericKeys[i]); ++i) {
                struct[k] = +struct[k] || 0;
            }

            // allow undefined days and months
            struct[2] = (+struct[2] || 1) - 1;
            struct[3] = +struct[3] || 1;

            if (struct[8] !== 'Z' && struct[9] !== undefined) {
                minutesOffset = struct[10] * 60 + struct[11];

                if (struct[9] === '+') {
                    minutesOffset = 0 - minutesOffset;
                }
            }

            timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
        }
        else {
            timestamp = origParse ? origParse(date) : NaN;
        }

        return timestamp;
    };
}(Date));

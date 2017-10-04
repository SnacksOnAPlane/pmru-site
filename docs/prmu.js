var mod = angular.module('PRMU', []);

var CITIES = "Adjuntas,Aguada,Aguadilla,Aguas Buenas,Aibonito,Añasco,Arecibo,Arroyo,Barceloneta,Barranquitas,Bayamon,Cabo Rojo,Caguas,Camuy,Canóvanas,Carolina,Cataño,Cayey,Ceiba,Ciales,Cidra,Coamo,Comerío,Corozal,Culebra,Dorado,Fajardo,Florida,Guayama,Guayanilla,Guaynabo,Gurabo,Guánica,Hatillo,Hormigueros,Humacao,Isabela,Isla Verde,Jayuya,Juana Díaz,Juncos,Lajas,Lares,Las Marías,Las Piedras,Luquillo,Loiza,Manati,Maricao,Maunabo,Mayagüez,Moca,Morovis,Naguabo,Naranjito,Orocovis,Patillas,Peñuelas,Ponce,Quebradillas,Rincón,Rio Grande,Sabana Grande,Salinas,San Germán,San Juan,San Lorenzo,San Sebastián,Santa Isabel,Toa Alta,Toa Baja,Trujillo Alto,Utuado,Vega Alta,Vega Baja,Villalba,Yabucoa,Yauco".split(',');

mod.controller('MainController', ['$scope','$http','$sce', function($scope, $http, $sce) {
  $scope.cities = CITIES;
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
        console.log(entry);
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

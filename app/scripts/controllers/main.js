'use strict';

angular.module('imageEditorApp')
    .controller('MainCtrl', function($scope) {

        $scope.setImageFile = function(element) {
            // Get image data from element
            // Put the data into canvas element
            $scope.init();
            var reader = new FileReader();
            var file = element.files[0];

            reader.onload = function(e) {
                // Set image src
                $scope.image.src = e.target.result;
                console.log($scope.image.src);
            };
            reader.readAsDataURL(file);
        };
        $scope.init = function() {
            // Curent values
            $scope.brightness = 0;
            $scope.contrast = 1;
            $scope.strength = 0;
            $scope.colors = {
                red: 255,
                green: 189,
                blue: 0
            };
            $scope.autocontrast = false;
            $scope.vignette = false;


            // Image preview
            $scope.canvas = angular.element('#myCanvas')[0];
            $scope.ctx = $scope.canvas.getContext("2d");
            $scope.image = new Image();
            $scope.image.onload = $scope.resetImage;
        };

        $scope.init();

        $scope.resetImage = function() {
            // When image data is loaded,
            // set the canvas dimensions to be image dimensions
            $scope.canvas.width = $scope.image.width;
            $scope.canvas.height = $scope.image.height;
            // put the data into canvas element
            $scope.ctx.drawImage($scope.image, 0, 0);
            // get data
            $scope.imageData = $scope.ctx.getImageData(0, 0, $scope.image.width, $scope.image.height);
            $scope.dataArray = $scope.imageData.data;
        };

        $scope.changeBrightness = function() {
            $scope.resetImage();
            for (var i = 0; i < $scope.dataArray.length; i += 4) {

                $scope.dataArray[i] += parseFloat($scope.brightness);
                $scope.dataArray[i + 1] += parseFloat($scope.brightness);
                $scope.dataArray[i + 2] += parseFloat($scope.brightness);
            }
            $scope.ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
            $scope.ctx.putImageData($scope.imageData, 0, 0);
        };

        $scope.changeContrast = function() {
            $scope.resetImage();
            var factor = (259 * (parseFloat($scope.contrast) + 255)) / (255 * (259 - parseFloat($scope.contrast)));
            for (var i = 0; i < $scope.dataArray.length; i += 4) {
                $scope.dataArray[i] = factor * ($scope.dataArray[i] - 128) + 128;
                $scope.dataArray[i + 1] = factor * ($scope.dataArray[i + 1] - 128) + 128;
                $scope.dataArray[i + 2] = factor * ($scope.dataArray[i + 2] - 128) + 128;
            }
            $scope.ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
            $scope.ctx.putImageData($scope.imageData, 0, 0);
        };

    });

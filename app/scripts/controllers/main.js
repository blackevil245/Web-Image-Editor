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
            $scope.strength = 100;
            $scope.colors = {
                red: 0,
                green: 0,
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

        $scope.applyFilters = function() {
            // Apply filters
            $scope.resetImage();
            $scope.changeBrightness();
            $scope.changeContrast();
            $scope.tint();
            if ($scope.autocontrast) {
                $scope.autoContrast();
            }

            // Reset canvas
            $scope.ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
            $scope.ctx.putImageData($scope.imageData, 0, 0);
        };

        $scope.changeBrightness = function() {
            for (var i = 0; i < $scope.dataArray.length; i += 4) {

                $scope.dataArray[i] += parseFloat($scope.brightness);
                $scope.dataArray[i + 1] += parseFloat($scope.brightness);
                $scope.dataArray[i + 2] += parseFloat($scope.brightness);
            }
        };

        $scope.changeContrast = function() {
            var factor = (259 * (parseFloat($scope.contrast) + 255)) / (255 * (259 - parseFloat($scope.contrast)));
            for (var i = 0; i < $scope.dataArray.length; i += 4) {
                $scope.dataArray[i] = factor * ($scope.dataArray[i] - 128) + 128;
                $scope.dataArray[i + 1] = factor * ($scope.dataArray[i + 1] - 128) + 128;
                $scope.dataArray[i + 2] = factor * ($scope.dataArray[i + 2] - 128) + 128;
            }
        };

        $scope.tint = function() {
            for (var i = 0; i < $scope.dataArray.length; i += 4) {
                $scope.dataArray[i] = parseFloat($scope.colors.red) * (parseFloat($scope.strength)) / 100 + $scope.dataArray[i];
                $scope.dataArray[i + 1] = parseFloat($scope.colors.green) * (parseFloat($scope.strength)) / 100 + $scope.dataArray[i + 1];
                $scope.dataArray[i + 2] = parseFloat($scope.colors.blue) * (parseFloat($scope.strength)) / 100 + $scope.dataArray[i + 2];
            }
        };

        var rmin = 0,
            gmin = 0,
            bmin = 0,
            rmax = 0,
            gmax = 0,
            bmax = 0;

        var rvals = [];
        var gvals = [];
        var bvals = [];

        $scope.autoContrast = function() {
            var array = $scope.imageData.data;

            for (var i = 0; i < array.length; i += 4) {
                if (array[i] >= rmax) {
                    rmax = array[i];
                } else if (array[i] <= rmin) {
                    rmin = array[i];
                }

                if (array[i + 1] >= gmax) {
                    gmax = array[i + 1];
                } else if (array[i + 1] <= gmin) {
                    gmin = array[i + 1];
                }
                if (array[i + 2] >= bmax) {
                    bmax = array[i + 2];
                } else if (array[i + 2] <= bmin) {
                    bmin = array[i + 2];
                }

                rvals.push(array[i]);
                gvals.push(array[i + 1]);
                bvals.push(array[i + 2]);
            }
            console.log(rmin + " " + rmax + " " + gmin + " " + gmax + " " + bmin + " " + bmax);
            for (i = 0; i < array.length; i += 4) {
                array[i] = array[i] * ((array[i] - rmin) / (rmax - rmin));
                array[i + 1] = array[i + 1] * ((array[i + 1] - gmin) / (gmax - gmin));
                array[i + 2] = array[i + 2] * ((array[i + 2] - bmin) / (bmax - bmin));

            }
            $scope.printHistogram();
        };

        $scope.printHistogram = function() {
            //get a reference to the canvas to draw on
            var ctx = $("#histogramCanvas")[0].getContext("2d");

            var colorBars = function(max, vals, color, y) {
                ctx.fillStyle = color;
                $.each(vals, function(i, x) {
                    var pct = (vals[i] / max) * 100;
                    ctx.fillRect(i, y, 1, -Math.round(pct));
                });
            };

            colorBars(rmax, rvals, "rgb(255,0,0)", 100);
            colorBars(gmax, gvals, "rgb(0,255,0)", 200);
            colorBars(bmax, bvals, "rgb(0,0,255)", 300);
        };

        $scope.saveImage = function() {
            var imgAsDataUrl = $scope.canvas.toDataURL('image/png');
            $scope.url = imgAsDataUrl;
        };
    }).config(function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|coui|data):/);
    });

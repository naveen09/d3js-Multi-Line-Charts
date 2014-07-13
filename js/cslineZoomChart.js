/* Call this method from html, by passing the div id and data source*/
function loadLineChart(container,datasource) {
    var alldata,
        fieldMap,
        keys = [],
        dateArray = [],
        finalData = [];

    d3.json(datasource, function (error, data) {
        alldata = data;
        fieldMap = alldata.field_to_data_map;

        keys = d3.keys(fieldMap).filter(function (key) {
            return key !== null;
        });
        // Parse the json and store all dates in dateArray
        for (var p = 0; p < keys.length; p++) {
            var obj = fieldMap[keys[p].toString()];

            for (var j = 0; j < obj.length; j++) {
                var len = dateArray.length;
                var ar = 0
                var available = false;
                var tempDate = obj[j].date;
                while (ar < len) {
                    if (dateArray[ar] == tempDate) {
                        available = true;
                    }
                    ar++;
                }
                if (available == false) {
                    dateArray[dateArray.length] = tempDate;
                }
            }
        }
		/* sort date array for consistency to maintain order*/
        dateArray.sort();
		/* call buildChart() by passing the globalIndex (for each dataset) */
        function buildChart(globalIndex) {

             var objectDataValues = new Array(dateArray.length);
                        var objectDateValues = [];
                        var objCounter = 0;
                        var obj = fieldMap[keys[globalIndex].toString()];
                        var tempDates = new Array();
						// store temporary dates in this tempDates array for each object.
                        for (var jj = 0; jj < obj.length; jj++) {
                            tempDates[jj] = obj[jj].date;
                        }
						
						// loop through global dateArray and if date from temporary array isn't found in global array
						// add that to entry to maintain/cover missing dates for consistency.
                        for (var j = 0; j < dateArray.length; j++) {
                            objectDataValues[j] = null;
                            objectDateValues[j] = dateArray[j];
                            var found = false;
                            for (var tempIndex = 0; tempIndex < tempDates.length; tempIndex++) {
                                if (tempDates[tempIndex] == dateArray[j]) {
                                    found = true;
                                    break;
                                }
                            }
							//if the date entry is found add the value to objectDatavalues, else we are already adding 0 initially.
                            if (found) {
                                objectDataValues[j] = obj[objCounter++].value;
                            }
                        }
            var iValues = [];
            for (var i = 0; i < objectDataValues.length; i++) {
                iValues.push({
                    x: new Date(objectDateValues[i]),
                    y: parseInt(objectDataValues[i])
                });

            }
            return iValues;
        }

        for (k in keys) {
            var iData = buildChart(k);
            finalData.push({
                key: keys[k],
                values: iData
            });
        }

        // Wrapping in nv.addGraph allows for '0 timeout render', stores rendered charts in nv.graphs, and may do more in the future... it's NOT required

        nv.addGraph(function () {
                var chart = nv.models.lineWithFocusChart()
					//.useInteractiveGuideline(true)
                    .color(['#F23E2C','#3CF461','#EEAC2D'])
                    .options({
                        margin: {
                            left: 100,
                            bottom: 100,
                            right: 100
                        },
                        x: function (d) {
                            return d.x
                        },
                        y: function (d) {
                            return d.y
                        },
                        showXAxis: true,
                        showYAxis: true,
                        transitionDuration: 250
                    });
				chart.x2Axis.tickFormat(function (d){
				 return d3.time.format('%y-%m-%d')(new Date(d))
				});
                chart.xAxis
                    .tickFormat(function (d) {
                        return d3.time.format('%y-%m-%d')(new Date(d))
                    });
				/* give dinalData to datum to draw the graph */
                d3.select(''+container+' svg')
                    .datum(finalData)
                    .call(chart);

                //TODO: Figure out a good way to do this automatically
                nv.utils.windowResize(chart.update);

                chart.dispatch.on('stateChange', function (e) {
                    nv.log('New State:', JSON.stringify(e));
                });
				
                return chart;
            });
    });
}
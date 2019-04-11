# SVG-Pie-and-Donut
A small plugin to generate an SVG Pie or Donut chart.

Parameters for the pie/donut chart

type: "donut", // String. 'pie' for pie chart and 'donut' for donut chart. default is 'pie'.
is3D: false, // Boolean. true for 3D chart, false for 2D chart. default is false.
id: "canvasCircle", // String. 'id' of chart element. default is "canvas_" + Date.now()
title: "", // String. title for the chart. default is empty.
titleColor: "black", // String. color of the title, can be a HEX string.
width: 400, // Number. width of chart in pixels. default is 200.
height: 400, // Number. height of chart in pixels. default is 200.
donutHoleSize: 0.4, // Number. size (1 is 100%) of the donut hole for donut charts. default is 0.5. has no meaning if type is pie.
showIndicator: true, // Boolean. true to show indicator on mouseover, false to nor show indicator on mouseover. default is true.
explodeAll: false, // Boolean. true to explode all borders on click, false to explode only one border at a time (others will be normal). default is true.
sliceBorders: false, // Boolean. true to show slice borders or false to hide slice borders. default is true.
colors: String Array. ['#5DA5FA', '#FAA43A', '#60BD68', '#959595', '#B2812F', '#1585AC', '#E9967A', '#B20612', '#ADD8E6', '#DECFFF', '#006400', '#F15854', '#4D4D4D', '#17BECF', '#BCBD22', '#E377C2', '#8C56FF', '#9467BD', '#2CA02C', '#FF7F0E'], // specific colors for chart slices.
showTooltip: true, // Boolean. true or false. default is true.
showLabel: "percent", // String. 'percent' or 'value' (any other value will remove the label). default is none "".
labelColor: "invert", // String. 'normal' for slice color, 'invert' for inverted slice color or specific color. default is white.
isLabelInside: true, // Boolean. true to show label inside slice, false to show outside slice. default is true.
showLegend: true, // Bollean. true or false. default is true.
legendColor: "black", // String. 'normal' for slice color, 'invert' for inverted slice color or specific color. default is black.
background: "#FCFCFC", // String. background color of chart. default is #FCFCFC.
data:[] // Data Array. data for the chart slices, should be of the format [{label: '<label to show>', value: <numeric value>}].

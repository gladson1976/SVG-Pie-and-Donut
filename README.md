# SVG Pie and Donut
A small plugin to generate an SVG Pie or Donut chart.

Parameters for the pie/donut chart

<b>type</b> - The type of the chart to generate. This is a String value. Valid values are <i><b>pie</b></i> and <i><b>donut</b></i>, default is <i><b>pie</b></i>.<br>
<b>is3D</b> - Generate a 3D or 2D chart. This is a Boolean value. Valid values are <i><b>true</b></i> for 3D chart, <i><b>false</b></i> for 2D chart, default is <i><b>false</b></i>.<br>
<b>id</b> - The id of the chart element. This is a String value. Default is <i><b>"canvas_" + Date.now()</b></i><br>
<b>title</b> - The title to be displayed for the chart. This is a String value. Default is <i><b>empty string</b></i>.<br>
<b>titleColor</b> - The color of the title in the chart. This is a String value. Valid values are <i><b>any color name</b></i> or a <i><b>HEX string</b></i>, default is <i><b>black</b></i>.<br>
<b>width</b> - Width of the chart element in pixels. This is an Integer value. Default is <i><b>200</b></i>.<br>
<b>height</b> - Height of the chart element in pixels. This is an Integer value. Default is <i><b>200</b></i>.<br>
<b>donutHoleSize</b> - The size of the hole for the donut charts. This is a percentage of the donut radius with 1 being 100%. This has no meaning if type is "pie". This is a Decimal value. Default is <i><b>0.5</b></i>.<br>
<b>showIndicator</b> - Show an indicator on mouseover for the slices. This is a Boolean value. <i><b>true</b></i> to show indicator, <i><b>false</b></i> to not show indicator, default is <i><b>true</b></i>.<br>
<b>explodeAll</b> - Whether to show only one slice exploded or all slices exploded at a time (Works only for 2D charts). This is a Boolean value. <i><b>true</b></i> to explode all borders on click, <i><b>false</b></i> to explode only one border at a time (others will be normal), default is <i><b>true</b></i>.<br>
<b>sliceBorders</b> - Whether to show a border for each slice in a darker color. This is a Boolean value. <i><b>true</b></i> to show borders or <i><b>false</b></i> to hide borders, default is <i><b>true</b></i>.<br>
<b>colors</b> - The list of colors to show in the chart. The first color will be shown in the 3 o'clock position. if there are lesser colors than slices, then this will wrap around from the first color. This is a String Array. Default is <i><b>['#5DA5FA', '#FAA43A', '#60BD68', '#959595', '#B2812F', '#1585AC', '#E9967A', '#B20612', '#ADD8E6', '#DECFFF', '#006400', '#F15854', '#4D4D4D', '#17BECF', '#BCBD22', '#E377C2', '#8C56FF', '#9467BD', '#2CA02C', '#FF7F0E']</b></i>.<br>
<b>showTooltip</b> - Whether to show tooltips on mouseover of the slices. This is a Boolean value. <i><b>true</b></i> to show tooltips and <i><b>false</b></i> to hide tooltips, default is <i><b>true</b></i>.<br>
<b>showLabel</b> - The type of label to show in the slices. This is a String value. Valid values are <i><b>percent</b></i> to show the percentage of the total or <i><b>value</b></i> to show the raw value for the slice (any other value will remove the label), default is <i><b>empty string</b></i> (no label).<br>
<b>labelColor</b>: Color of the label shown in the slices, This is a String value. Valid values are <i><b>normal</b></i> for slice color, <i><b>invert</b></i> for inverted slice color or specific color, default is <i><b>white</b></i>.<br>
<b>isLabelInside</b> - Whether to show the label inside the slice to outside the slice. This is a Boolean value. Valid values are <i><b>true</b></i> to show label inside slice, <i><b>false</b></i> to show outside slice, default is <i><b>true</b></i>.<br>
<b>showLegend</b> - Whether to show the legend of the chart. Note: Showing the legend will increase the width of the chart. This is a Boolean value. Valid values are <i><b>true</b></i> to show the legend or <i><b>false</b></i> to hide the legend, default is <i><b>true</b></i>.<br>
<b>legendColor</b> - The color of the legend text items. This is a String value. Valid values are <i><b>normal</b></i> for slice color, <i><b>invert</b></i> for inverted slice color or <i><b>any specific color</b></i>, default is <i><b>black</b></i>.<br>
<b>background</b> - The color of the chart background. This is a String value. Valid values are <i><b>any color name</b></i> or a <i><b>HEX string</b></i>, default is <i><b>#FCFCFC</b></i>.<br>
<b>data</b> - The data labels and values to use in the chart. This is a Data Array of the following format. Should be of the format <i><b>[{label: '&lt;label to show&gt;', value: &lt;numeric value&gt;}, ...]</b></i>.<br>

const cryptoPie = document.getElementById('cryptoPie').getContext('2d')
var myPieChart = new Chart(cryptoPie, {
    type: 'pie',
    data: {
        labels: ['BTC', 'ETH', 'BNB', 'XVS'],
        datasets: [{
            label: 'Coin',
            backgroundColor: ['#d1ac7a', '#a3fe22', '#b1123f', '#f1ffa1'],
            data: ['12', '5', '50', '33']
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Portfolio share'
        }
    }
});


const cryptoTimeline = document.getElementById('cryptoTimeline').getContext('2d')

const randomColor = () => {
    r = Math.floor(Math.random() * 255) + 1
    g = Math.floor(Math.random() * 255) + 1
    b = Math.floor(Math.random() * 255) + 1
    return `rgba(${r},${g},${b},0.4)`
}

var myPieChart = new Chart(cryptoTimeline, {
    type: 'line',
    animation: true,
    data: {
        labels: ["January", "February", "March", "April", "May", "June"],
        datasets: [
            {
                borderColor: randomColor(),
                data: [12, 34, 1, 41, 33, 66],
                label: 'BNB',
                fill: false,
                lineTension: 0
            },
            {
                borderColor: randomColor(),
                data: [203, 156, 99, 251, 305, 247],
                label: 'BTC',
                fill: false,
                lineTension: 0
            },
            {
                borderColor: randomColor(),
                data: [33, 87, 21, 31, 45, 1],
                label: 'ETH',
                fill: false,
                lineTension: 0
            },
            {
                borderColor: randomColor(),
                data: [34, 12, 65, 45, 13, 12],
                label: 'BTC',
                fill: false,
                lineTension: 0
            }

        ]
    },

    animationSteps: 100,
    animationEasing: "easeOutQuart",
    scaleFontSize: 16,
    responsive: true,
    showTooltip: true,
    tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

    scaleShowGridLines: false,
    bezierCurve: false,
    pointDotRadius: 5,

});
const cryptoPie = document.getElementById('cryptoPie').getContext('2d')
const dataPie = document.getElementById('cryptoPie').getAttribute('data')
var jsondataPie = JSON.parse(dataPie)

var timeTimeLine = JSON.parse(document.getElementById('cryptoTimeline').getAttribute('datatime'))
var datasetTimeLine = JSON.parse(document.getElementById('cryptoTimeline').getAttribute('dataset'))

var myPieChart = new Chart(cryptoPie, {
    type: 'pie',
    data: {
        labels: Object.keys(jsondataPie),
        datasets: [{
            label: 'Coin',
            backgroundColor: ['#d1ac7a', '#a3fe22', '#b1123f', '#f1ffa1'],
            data: Object.values(jsondataPie)
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


var myPieChart = new Chart(cryptoTimeline, {
    type: 'line',
    animation: true,
    data: {
        labels: timeTimeLine,
        datasets: datasetTimeLine
    }
});
$(document).ready(() => {
    var dtLimit = new Date();
    dtLimit.setDate(dtLimit.getDate());
    finalDt = dtLimit.toLocaleString('fr-CA', { year: 'numeric', month: 'numeric', day: 'numeric' })
    document.getElementById('purchaseDt').setAttribute('max', finalDt)
    var newTotal = calcTotal()
    $('#totalWallet').html(newTotal)

})


const addCurr = document.getElementById('addCurr');
const currAmount = document.getElementById('amountCrypto')
const currTable = $('#currencyTable tbody')
const currTable_2 = $('#currencyTable').get(0)


const postData = (dictData) => {
    $.ajax({
        type: 'POST',
        processData: true,
        contentType: "application/json; charset=utf-8",
        url: '/wallet/transactions',
        data: JSON.stringify(dictData),
    })
}

const config = { attributes: true, childList: true, subtree: true };

const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            transaction_data = []

            rowcurrTable = $('#currencyTable tbody tr').each(function () {
                $td = $(this).find('td')
                dict_data = {}
                if ($td.eq(0)) {
                    dict_data['currency'] = $td.eq(0).text().replace('/\n', '').trim()
                    dict_data['amount'] = $td.eq(1).text().replace('/\n', '').trim()
                    dict_data['purchaseDate'] = $td.eq(2).text().replace('/\n', '').trim()
                    dict_data['purchPrice'] = $td.eq(3).text().replace('/\n', '').trim()
                    dict_data['currentPrice'] = $td.eq(4).text().replace('/\n', '').trim()
                    dict_data['profit'] = $td.eq(5).text().replace('/\n', '').trim()
                }
                transaction_data.push(dict_data)
            })
            postData(transaction_data)
        }
        else if (mutation.type === 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
    }
};



const observer = new MutationObserver(callback);
observer.observe(currTable_2, config);



const distDays = (startDate) => {
    todayDate = new Date().getTime();
    startDate = Date.parse(startDate)
    daySpan = Math.floor((todayDate - startDate) / 1000 / 3600 / 24)
    return daySpan

}

const getAvgLastPrice = (responseData) => {
    lastEntry = responseData.Data[1]
    return (lastEntry['high'] + lastEntry['low']) / 2
}


addCurr.addEventListener('click', async function (e) {
    e.preventDefault();
    const cryptoSelected = $('#currType option:selected')
    const cryptoSymbol = cryptoSelected.text().trim();
    const cryptoVal = cryptoSelected.val();
    const purchDate = $('#purchaseDt').val()
    const daysPurchase = distDays(purchDate) + 1
    rowString = ''
    let stringQuery = `http://localhost:3000/wallet/historical/currency?cn=${cryptoSymbol}&pd=${daysPurchase}`
    const response = await fetch(stringQuery)
        .then(response => response.json())
        .then((data) => {
            purchPrice = getAvgLastPrice(data)
            rowString = `<tr><td>${cryptoSymbol}</td><td>${currAmount.value}</td><td>${purchDate}</td><td>${Math.round((purchPrice) * 100) / 100}</td><td>currPrice</td><td id="totalCurr">totalProfit</td>  <td><button type="button" class="btn btn-danger">&#128465;</button>
            </td></tr>`
        })
    rowString = rowString.replace('currPrice', Math.round((cryptoVal) * 100) / 100).replace('totalProfit', Math.round((currAmount.value * (cryptoVal - purchPrice)) * 100) / 100)

    currTable.append(rowString)
    var newTotal = calcTotal()
    $('#totalWallet').html(newTotal)

})

const calcTotal = () => {
    accPrice = 0
    $('#currencyTable tbody tr').each(function () {
        var val = $(this).find('td:nth-child(6)').html();
        if (!isNaN(val)) {
            accPrice += parseFloat(val)
        }
    })
    accPrice = accPrice.toFixed(2)
    return `<label style='color: ${accPrice < 0 ? 'red;' : 'green;'}'>${accPrice}${accPrice < 0 ? '&#8681;' : '&#8679;'} </label>`
}

$('#currencyTable').on('click', 'button', function (e) {
    $(this).closest('tr').remove()
    var newTotal = calcTotal()
    $('#totalWallet').html(newTotal)
})



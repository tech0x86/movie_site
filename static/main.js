function showDailyData() {
    // 現在のURLから日付パラメータを取得
    const urlParams = new URLSearchParams(window.location.search);

    let date = urlParams.get('date') || new Date().toISOString().slice(0, 10);
    // 日付形式の確認と変換（yyyymmdd形式をyyyy-mm-dd形式に変換）
    if (date.match(/^\d{8}$/)) { // yyyymmdd形式を確認
        date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    }

    console.log("daily date: ",date);

    // 開始日付と終了日付を設定
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(date);

    const start_date = startDate.toISOString().slice(0, 10).replaceAll('-', '');
    const end_date = endDate.toISOString().slice(0, 10).replaceAll('-', '');

    fetch(`/daily_data?start_date=${start_date}&end_date=${end_date}`)
        .then(response => response.json())
        .then(data => {
            console.log("Received dairy data:", data);
            // テーブル要素を生成
            let table = '<table><tr>';
            for (const field of data.schema.fields) {
                table += `<th>${field.name}</th>`;
            }
            table += '</tr>';

            // データ行をテーブルに追加
            for (const item of data.data) {
                table += '<tr>';
                for (const field of data.schema.fields) {
                    table += `<td>${item[field.name]}</td>`;
                }
                table += '</tr>';
            }
            table += '</table>';

            // テーブルをHTMLに追加
            document.getElementById('dailyData').innerHTML = table;
        });
}

function showGraph() {
    const urlParams = new URLSearchParams(window.location.search);

    let date = urlParams.get('date') || new Date().toISOString().slice(0, 10);
    // 日付形式の確認と変換（yyyymmdd形式をyyyy-mm-dd形式に変換）
    if (date.match(/^\d{8}$/)) { // yyyymmdd形式を確認
        date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    }

    console.log("date: ",date);

    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(date);

    const start_date = startDate.toISOString().slice(0, 10).replaceAll('-', '');
    const end_date = endDate.toISOString().slice(0, 10).replaceAll('-', '');

    console.log(`Fetching data from: /car_truck_data?start_date=${start_date}&end_date=${end_date}`);

    fetch(`/car_truck_data?start_date=${start_date}&end_date=${end_date}`)
        .then(response => response.json())
        .then(data => {
            console.log("Received data:", data);
            const ctx = document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.data.map(item => item.date),
                    datasets: [{
                        label: 'Car and Truck Total',
                        data: data.data.map(item => item.car_truck_total),
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 2
                    }, {
                        label: 'Other Total',
                        data: data.data.map(item => item.other_total),
                        borderColor: 'rgb(153, 102, 255)',
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }).catch(error => {
            console.error("Error fetching data:", error);
        });
}
showGraph();
showDailyData();

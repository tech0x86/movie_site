        function showDailyData() {
            // 現在のURLから日付パラメータを取得
            const urlParams = new URLSearchParams(window.location.search);
            const date = urlParams.get('date') || new Date().toISOString().slice(0, 10);

            // 開始日付と終了日付を設定
            const startDate = new Date(date);
            startDate.setDate(startDate.getDate() - 7);
            const endDate = new Date(date);

            const start_date = startDate.toISOString().slice(0, 10).replaceAll('-', '');
            const end_date = endDate.toISOString().slice(0, 10).replaceAll('-', '');

            fetch(`/daily_data?start_date=${start_date}&end_date=${end_date}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('dailyData').innerHTML = JSON.stringify(data, null, 2);
                });
        }
        showDailyData();

    function showGraph() {
        const urlParams = new URLSearchParams(window.location.search);
        const date = urlParams.get('date') || new Date().toISOString().slice(0, 10);

        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 7);
        const endDate = new Date(date);

        const start_date = startDate.toISOString().slice(0, 10).replaceAll('-', '');
        const end_date = endDate.toISOString().slice(0, 10).replaceAll('-', '');

        console.log(`Fetching data from: /data?start_date=${start_date}&end_date=${end_date}`);

        fetch(`/data?start_date=${start_date}&end_date=${end_date}`)
            .then(response => response.json())
            .then(data => {
                console.log("Received data:", data);

                // ここでデータの構造を確認し、必要に応じて変換
                // ...

                const ctx = document.getElementById('myChart').getContext('2d');
                const myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.map(item => item.timestamp),
                        datasets: [{
                            label: 'Car and Truck Total',
                            data: data.map(item => item.car_truck_total),
                            borderColor: 'rgb(75, 192, 192)',
                            borderWidth: 1
                        }, {
                            label: 'Other Total',
                            data: data.map(item => item.other_total),
                            borderColor: 'rgb(153, 102, 255)',
                            borderWidth: 1
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


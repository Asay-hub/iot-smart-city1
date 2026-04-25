const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(type = 'alert') {
    if (audioContext.state === 'suspended') audioContext.resume();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    if (type === 'panic') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc.start(); osc.stop(audioContext.currentTime + 0.5);
    }
}

class WeatherStation {
    constructor(id, name, lat, lng) {
        this.id = id;
        this.name = name;
        this.lat = lat;
        this.lng = lng;
        this.temp = parseFloat((Math.random() * 30 + 5).toFixed(1)); 
        this.humidity = Math.floor(Math.random() * 60 + 30); 
        this.history = [];
        this.isRebooting = false;
        this.isOn = true;
        this.isCharging = false;
        this.windSpeed = (Math.random() * 10).toFixed(1);
        this.pressure = 1013;
        this.battery = Math.floor(Math.random() * 40) + 60; 
        this.aqi = Math.floor(Math.random() * 80) + 10; 
        this.radiation = Math.floor(Math.random() * 10) + 10;
        this.events = [`[${new Date().toLocaleTimeString()}] Станція ініціалізована`];
    }

    addEvent(msg) {
        this.events.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
        if (this.events.length > 5) this.events.pop(); 
    }

    update() {
        if(this.isRebooting) return;

        if (this.isCharging) {
            this.battery = Math.min(100, this.battery + (Math.random() * 2 + 1));
        } else if (this.isOn) {
            if(Math.random() > 0.9) this.battery = Math.max(0, this.battery - 0.5); 
            if(this.battery === 0) {
                this.isOn = false;
                this.addEvent("Відключення через розряд батареї");
                logEvent(`⚠️ Вузол [${this.name}] автоматично вимкнувся (Батарея 0%).`);
            }
        }

        if (!this.isOn) {
            this.history.push(this.history.length > 0 ? this.history[this.history.length - 1] : this.temp);
            if (this.history.length > 20) this.history.shift();
            return;
        }

        if (Math.random() > 0.985) {
            const spike = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 4 + 4);
            this.temp = parseFloat((this.temp + spike).toFixed(1));
            if (Math.random() > 0.5) this.aqi += Math.floor(Math.random() * 50 + 20);
            if (Math.random() > 0.8) this.radiation += Math.floor(Math.random() * 20 + 10);
        } else {
            const change = (Math.random() * 1.6 - 0.8);
            this.temp = parseFloat((this.temp + change).toFixed(1));
            this.aqi = Math.floor(Math.max(10, Math.min(200, this.aqi + (Math.random() * 10 - 5))));
            this.radiation = Math.floor(Math.max(8, Math.min(100, this.radiation + (Math.random() * 4 - 2))));
        }
        
        if(this.temp > 45) this.temp = 42.5; 
        if(this.temp < -15) this.temp = -12.5;

        this.humidity = Math.floor(Math.min(100, Math.max(0, this.humidity + (Math.random() * 6 - 3))));
        this.windSpeed = Math.abs(parseFloat(this.windSpeed) + (Math.random() * 2 - 1)).toFixed(1);

        this.history.push(this.temp);
        if (this.history.length > 20) this.history.shift();

        if (this.temp >= 30 && Math.random() > 0.9) {
            showToast(`🌡️ Критична температура: ${this.name} (${this.temp}°C)`);
            this.addEvent(`Аномальна температура: ${this.temp}°C`);
        }
        if (this.aqi > 150 && Math.random() > 0.9) {
            showToast(`⚠️ Забруднення повітря: ${this.name} (AQI: ${this.aqi})`);
            this.addEvent(`Високий AQI: ${this.aqi}`);
        }
        if (this.radiation > 30 && Math.random() > 0.9) {
            showToast(`☢️ Увага! Підвищений радіаційний фон: ${this.name} (${this.radiation} мкР/год)`);
            this.addEvent(`Висока радіація: ${this.radiation} мкР/год`);
        }
    }
}

const stationsData = [
    new WeatherStation(1, "Київ", 50.4501, 30.5234),
    new WeatherStation(2, "Вінниця", 49.2331, 28.4682),
    new WeatherStation(3, "Луцьк", 50.7472, 25.3254),
    new WeatherStation(4, "Дніпро", 48.4647, 35.0462),
    new WeatherStation(5, "Донецьк", 48.0159, 37.8029),
    new WeatherStation(6, "Житомир", 50.2547, 28.6587),
    new WeatherStation(7, "Ужгород", 48.6208, 22.2879),
    new WeatherStation(8, "Запоріжжя", 47.8388, 35.1396),
    new WeatherStation(9, "Івано-Франківськ", 48.9226, 24.7111),
    new WeatherStation(10, "Кропивницький", 48.5079, 32.2623),
    new WeatherStation(11, "Луганськ", 48.5740, 39.3078),
    new WeatherStation(12, "Львів", 49.8397, 24.0297),
    new WeatherStation(13, "Миколаїв", 46.9750, 31.9946),
    new WeatherStation(14, "Одеса", 46.4825, 30.7233),
    new WeatherStation(15, "Полтава", 49.5883, 34.5514),
    new WeatherStation(16, "Рівне", 50.6199, 26.2516),
    new WeatherStation(17, "Суми", 50.9077, 34.7981),
    new WeatherStation(18, "Тернопіль", 49.5535, 25.5948),
    new WeatherStation(19, "Харків", 49.9935, 36.2304),
    new WeatherStation(20, "Херсон", 46.6354, 32.6169),
    new WeatherStation(21, "Хмельницький", 49.4230, 26.9871),
    new WeatherStation(22, "Черкаси", 49.4444, 32.0598),
    new WeatherStation(23, "Чернівці", 48.2921, 25.9352),
    new WeatherStation(24, "Чернігів", 51.4982, 31.2893),
    new WeatherStation(25, "Сімферополь", 44.9521, 34.1024)
];

const coaPages = {
    "Київ": "Герб_Києва", "Вінниця": "Герб_Вінниці", "Луцьк": "Герб_Луцька",
    "Дніпро": "Герб_Дніпра", "Донецьк": "Герб_Донецька", "Житомир": "Герб_Житомира",
    "Ужгород": "Герб_Ужгорода", "Запоріжжя": "Герб_Запоріжжя", "Івано-Франківськ": "Герб_Івано-Франківська",
    "Кропивницький": "Герб_Кропивницького", "Луганськ": "Герб_Луганська", "Львів": "Герб_Львова",
    "Миколаїв": "Герб_Миколаєва", "Одеса": "Герб_Одеси", "Полтава": "Герб_Полтави",
    "Рівне": "Герб_Рівного", "Суми": "Герб_Сум", "Тернопіль": "Герб_Тернополя",
    "Харків": "Герб_Харкова", "Херсон": "Герб_Херсона", "Хмельницький": "Герб_Хмельницького",
    "Черкаси": "Герб_Черкас", "Чернівці": "Герб_Чернівців", "Чернігів": "Герб_Чернігова",
    "Сімферополь": "Герб_Сімферополя"
};

let map, chart;
const markers = {};
const mapCircles = {}; 

window.onload = () => {
    initMap();
    initChart();
    generateClouds();
    startClock();
    initStationSelector();
    initChartMenu();
    updateForecast();
    setInterval(() => simulationLoop(false), 2000); 
    setInterval(updateForecast, 10000);
    logEvent("Система активована. Підключено 25 регіональних вузлів.");

    window.addEventListener('resize', () => {
        if (map) {
            setTimeout(() => map.invalidateSize(), 100);
        }
    });
};

function filterStations() { simulationLoop(true); }

function triggerPanic() {
    playBeep('panic'); 
    logEvent("🛑 УВАГА: ЗАФІКСОВАНО МАСОВИЙ ЗБІЙ МЕРЕЖІ!");
    showToast("КРИТИЧНА ПОМИЛКА: Втрата зв'язку з вузлами");
    
    stationsData.forEach(s => {
        if (Math.random() > 0.5) {
            s.isOn = false;
            s.addEvent("Аварійне відключення");
        } else if (Math.random() > 0.7) {
            s.temp = 42;
            s.aqi = 190;
            s.radiation = Math.floor(Math.random() * 50) + 40;
            s.addEvent("Збій сенсорів");
        }
    });
    simulationLoop(true);
}

function turnOnAll() {
    stationsData.forEach(s => {
        if (!s.isOn) {
            s.isOn = true;
            s.addEvent("Глобальне увімкнення");
        }
    });
    logEvent("🟢 ГЛОБАЛЬНА КОМАНДА: Всі станції УВІМКНЕНО.");
    simulationLoop(true);
}

function turnOffAll() {
    stationsData.forEach(s => {
        if (s.isOn) {
            s.isOn = false;
            s.addEvent("Глобальне вимкнення");
        }
    });
    logEvent("⚫ ГЛОБАЛЬНА КОМАНДА: Всі станції ВИМКНЕНО.");
    simulationLoop(true);
}

function togglePower(id) {
    const s = stationsData.find(x => x.id === id);
    if (s) {
        s.isOn = !s.isOn;
        s.addEvent(s.isOn ? "Ручне увімкнення" : "Ручне вимкнення");
        logEvent(`Статус: Станція [${s.name}] ${s.isOn ? 'УВІМКНЕНА' : 'ВИМКНЕНА'}.`);
        simulationLoop(true); 
    }
}

function toggleCharging(id) {
    const s = stationsData.find(x => x.id === id);
    if (s) {
        s.isCharging = !s.isCharging;
        s.addEvent(s.isCharging ? "Підключено зарядку" : "Відключено зарядку");
        logEvent(`Статус: Зарядка для [${s.name}] ${s.isCharging ? 'ПІДКЛЮЧЕНА' : 'ВІДКЛЮЧЕНА'}.`);
        simulationLoop(true); 
    }
}

function openDetailsTab(id) {
    const s = stationsData.find(x => x.id === id);
    if (!s) return;

    const newWin = window.open('', '_blank');
    const coaPageName = coaPages[s.name];
    
    newWin.document.write(`
        <html>
        <head>
            <title>З'єднання...</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body style="background:#121212; color:#00d4ff; font-family:'Segoe UI', sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; text-align:center; padding: 20px;">
            <i class="fa-solid fa-satellite-dish fa-fade" style="font-size: 4rem; margin-bottom: 25px;"></i>
            <h2>Отримання телеметрії: ${s.name}...</h2>
            <p style="color:#888;">Завантаження даних через API Вікіпедії</p>
        </body>
        </html>
    `);

    if (s.name === 'Дніпро') {
        fetch(`https://uk.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(coaPageName)}`)
            .then(r => r.ok ? r.json() : {})
            .then(coaData => {
                let imgUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Coat_of_arms_of_Dnipro.svg/1024px-Coat_of_arms_of_Dnipro.svg.png';
                if (coaData.thumbnail && coaData.thumbnail.source) {
                    imgUrl = coaData.thumbnail.source.replace(/\/\d+px-/, '/1024px-');
                }
                renderStationTab(newWin, s, imgUrl, imgUrl);
            })
            .catch(() => renderStationTab(newWin, s, '', ''));
    } else {
        Promise.all([
            fetch(`https://uk.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(s.name)}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
            fetch(`https://uk.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(coaPageName)}`).then(r => r.ok ? r.json() : {}).catch(() => ({}))
        ]).then(([cityData, coaData]) => {
            let photoUrl = `https://picsum.photos/seed/smartcity${s.id}/1200/500`; 
            let coaUrl = `https://cdn-icons-png.flaticon.com/512/3602/3602145.png`; 
            if (cityData.thumbnail && cityData.thumbnail.source) {
                photoUrl = cityData.thumbnail.source.replace(/\/\d+px-/, '/1024px-');
            }
            if (coaData.thumbnail && coaData.thumbnail.source) {
                coaUrl = coaData.thumbnail.source.replace(/\/\d+px-/, '/300px-');
            }
            renderStationTab(newWin, s, photoUrl, coaUrl);
        });
    }
}

function renderStationTab(newWin, s, photoUrl, coaUrl) {
    const tempColor = getColorForTemp(s.temp);
    let headerStyle = `background: linear-gradient(to top, rgba(18,18,18,1) 0%, rgba(0,0,0,0.3) 100%), url('${photoUrl}') center/cover;`;
    if (s.name === 'Дніпро') {
        headerStyle = `background: linear-gradient(to top, rgba(18,18,18,1) 0%, rgba(0,0,0,0.7) 100%), url('${photoUrl}') center/contain no-repeat; background-color: #0b1a30;`;
    }

    const html = `
    <!DOCTYPE html>
    <html lang="uk">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Метеостанція: ${s.name}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"><\/script>
        <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #121212; color: #e0e0e0; margin: 0; padding: 0; }
            .header { ${headerStyle} height: 400px; display: flex; align-items: flex-end; padding: 40px; border-bottom: 3px solid #00d4ff; }
            .header-content { display: flex; align-items: center; gap: 30px; width: 100%; max-width: 1000px; margin: 0 auto; }
            .coat-of-arms { height: 140px; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.9)); }
            .header h1 { margin: 0; font-size: 4rem; color: #fff; text-shadow: 2px 2px 10px rgba(0,0,0,0.9); }
            .header p { margin: 10px 0 0 0; color: #ccc; font-size: 1.2rem; text-shadow: 1px 1px 5px rgba(0,0,0,0.9); }
            .container { max-width: 1000px; margin: 40px auto; padding: 0 20px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: #1e1e1e; padding: 20px; border-radius: 12px; border-left: 4px solid #00d4ff; box-shadow: 0 5px 15px rgba(0,0,0,0.3); transition: transform 0.3s; }
            .stat-card:hover { transform: translateY(-5px); }
            .stat-title { color: #888; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 10px; display: block; }
            .stat-value { font-size: 2rem; font-weight: bold; color: #fff; }
            .info-section { background: #1e1e1e; padding: 30px; border-radius: 12px; line-height: 1.6; border: 1px solid #333; margin-bottom: 40px; }
            .info-section h3 { color: #00d4ff; margin-top: 0; font-size: 1.5rem;}
            .btn-close { background: #333; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 1rem; display: inline-flex; align-items: center; gap: 8px; transition: 0.3s; margin-bottom: 20px; width: fit-content;}
            .btn-close:hover { background: #ff4d4d; }
            .chart-container { background: #1e1e1e; padding: 20px; border-radius: 12px; border: 1px solid #333; height: 300px; margin-bottom: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
            @media (max-width: 768px) {
                .header { height: auto; min-height: 300px; padding: 20px; justify-content: center; }
                .header-content { flex-direction: column; text-align: center; gap: 15px; }
                .header h1 { font-size: 2.5rem; }
                .stats-grid { grid-template-columns: 1fr; }
                .chart-container { height: 250px; padding: 10px; }
                .btn-close { width: 100%; justify-content: center; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="header-content">
                <img src="${coaUrl}" alt="Герб ${s.name}" class="coat-of-arms">
                <div>
                    <h1>${s.name}</h1>
                    <p><i class="fa-solid fa-location-dot"></i> Координати: ${s.lat}, ${s.lng} <br> <i class="fa-solid fa-microchip"></i> ID Вузла: #${s.id}</p>
                </div>
            </div>
        </div>
        <div class="container">
            <button class="btn-close" onclick="window.close()"><i class="fa-solid fa-arrow-left"></i> Закрити вкладку</button>
            <h2 style="margin-top: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;">Поточні показники (Live)</h2>
            <div class="stats-grid">
                <div class="stat-card" id="card-temp" style="border-color: ${tempColor}">
                    <span class="stat-title"><i class="fa-solid fa-temperature-half"></i> Температура</span>
                    <span class="stat-value" id="val-temp" style="color: ${tempColor}">${s.isOn ? s.temp + '°C' : 'ОФЛАЙН'}</span>
                </div>
                <div class="stat-card" style="border-color: #00d4ff">
                    <span class="stat-title"><i class="fa-solid fa-droplet"></i> Вологість</span>
                    <span class="stat-value" id="val-hum" style="color: #00d4ff">${s.isOn ? s.humidity + '%' : '--'}</span>
                </div>
                <div class="stat-card" style="border-color: #fcd34d">
                    <span class="stat-title"><i class="fa-solid fa-smog"></i> AQI (Якість повітря)</span>
                    <span class="stat-value" id="val-aqi" style="color: #fcd34d">${s.isOn ? s.aqi : '--'}</span>
                </div>
                <div class="stat-card" id="card-rad" style="border-color: ${s.radiation > 30 ? '#ff4d4d' : '#34d399'}">
                    <span class="stat-title"><i class="fa-solid fa-radiation"></i> Радіаційний фон</span>
                    <span class="stat-value" id="val-rad" style="color: ${s.radiation > 30 ? '#ff4d4d' : '#34d399'}">${s.isOn ? s.radiation + ' мкР/год' : '--'}</span>
                </div>
                <div class="stat-card" style="border-color: #a78bfa">
                    <span class="stat-title"><i class="fa-solid fa-wind"></i> Швидкість вітру</span>
                    <span class="stat-value" id="val-wind" style="color: #a78bfa">${s.isOn ? s.windSpeed + ' м/с' : '--'}</span>
                </div>
                <div class="stat-card" style="border-color: #34d399">
                    <span class="stat-title"><i class="fa-solid fa-gauge-high"></i> Атм. тиск</span>
                    <span class="stat-value" id="val-press" style="color: #34d399">${s.isOn ? s.pressure + ' hPa' : '--'}</span>
                </div>
                <div class="stat-card" id="card-bat" style="border-color: ${s.battery < 20 ? '#ff4d4d' : '#00ff88'}">
                    <span class="stat-title"><i class="fa-solid fa-battery-half"></i> Заряд батареї</span>
                    <span class="stat-value" id="val-bat" style="color: ${s.battery < 20 ? '#ff4d4d' : '#00ff88'}">${s.battery.toFixed(0)}%</span>
                </div>
            </div>
            <h2 style="margin-top: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;">Температурний графік (Live)</h2>
            <div class="chart-container">
                <canvas id="detailChart"></canvas>
            </div>
        </div>
        <script>
            function getChartColor(t) { 
                if (t >= 30) return '#ff4d4d'; 
                if (t >= 20) return '#ffcc00'; 
                if (t >= 10) return '#00ff88'; 
                if (t >= 0) return '#00d4ff';  
                return '#a78bfa';              
            }
            const ctx = document.getElementById('detailChart').getContext('2d');
            let hist = [${s.history.join(',')}];
            let initialColor = getChartColor(${s.temp});
            if (!${s.isOn}) initialColor = '#555';
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array(20).fill(''),
                    datasets: [{
                        label: 'Температура (°C)',
                        data: hist,
                        borderColor: initialColor,
                        backgroundColor: initialColor + '33', 
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: initialColor
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: '#333' }, ticks: { color: '#aaa', font: {size: 14} }, min: -15, max: 50 },
                        x: { display: false }
                    },
                    animation: { duration: 0 }
                }
            });
            setInterval(() => {
                if (window.opener && window.opener.stationsData) {
                    const station = window.opener.stationsData.find(x => x.id === ${s.id});
                    if (station) {
                        chart.data.datasets[0].data = station.history;
                        let color = getChartColor(station.temp);
                        if (!station.isOn) color = '#555';
                        chart.data.datasets[0].borderColor = color;
                        chart.data.datasets[0].backgroundColor = color + '33';
                        chart.data.datasets[0].pointBackgroundColor = color;
                        chart.update();
                        const valTemp = document.getElementById('val-temp');
                        const cardTemp = document.getElementById('card-temp');
                        if (station.isOn) {
                            valTemp.innerText = station.temp + '°C';
                            valTemp.style.color = color;
                            cardTemp.style.borderColor = color;
                        } else {
                            valTemp.innerText = 'ОФЛАЙН';
                            valTemp.style.color = '#555';
                            cardTemp.style.borderColor = '#555';
                        }
                        document.getElementById('val-hum').innerText = station.isOn ? station.humidity + '%' : '--';
                        document.getElementById('val-aqi').innerText = station.isOn ? station.aqi : '--';
                        document.getElementById('val-wind').innerText = station.isOn ? station.windSpeed + ' м/с' : '--';
                        document.getElementById('val-press').innerText = station.isOn ? station.pressure + ' hPa' : '--';
                        const radColor = station.radiation > 30 ? '#ff4d4d' : '#34d399';
                        document.getElementById('val-rad').innerText = station.isOn ? station.radiation + ' мкР/год' : '--';
                        document.getElementById('val-rad').style.color = station.isOn ? radColor : '#555';
                        document.getElementById('card-rad').style.borderColor = station.isOn ? radColor : '#555';
                        const batColor = station.battery < 20 ? '#ff4d4d' : '#00ff88';
                        document.getElementById('val-bat').innerText = station.battery.toFixed(0) + '%';
                        document.getElementById('val-bat').style.color = batColor;
                        document.getElementById('card-bat').style.borderColor = batColor;
                    }
                }
            }, 2000);
        <\/script>
    </body>
    </html>
    `;

    newWin.document.open();
    newWin.document.write(html);
    newWin.document.close();
}

function getColorForTemp(t) { 
    if (t >= 30) return '#ff4d4d'; 
    if (t >= 20) return '#ffcc00'; 
    if (t >= 10) return '#00ff88'; 
    if (t >= 0) return '#00d4ff';  
    return '#a78bfa';              
}

function simulationLoop(forceUpdate = false) {
    const container = document.getElementById('cards-container');
    const searchQuery = document.getElementById('searchBox').value.toLowerCase();
    const sortMode = document.getElementById('sortBox').value;
    
    let displayList = [...stationsData];

    if (sortMode === 'tempDesc') displayList.sort((a, b) => b.temp - a.temp);
    else if (sortMode === 'tempAsc') displayList.sort((a, b) => a.temp - b.temp);
    else if (sortMode === 'name') displayList.sort((a, b) => a.name.localeCompare(b.name));

    if(!forceUpdate) {
        stationsData.forEach(s => s.update());
    }

    container.innerHTML = '';

    displayList.forEach((s) => {
        if (s.name.toLowerCase().includes(searchQuery)) {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.style.opacity = (s.isRebooting || !s.isOn) ? '0.5' : '1';
            
            card.onclick = (e) => {
                if(!e.target.closest('button') && !e.target.closest('i.icon-btn')) openModal(s.id); 
            };

            let batIcon = 'fa-battery-half';
            if (s.battery > 80) batIcon = 'fa-battery-full';
            else if (s.battery > 20) batIcon = 'fa-battery-half';
            else batIcon = 'fa-battery-quarter';
            
            if (s.isCharging) batIcon = 'fa-plug';

            card.innerHTML = `
                <div class="card-header">
                    <span class="station-title">${s.name} ${!s.isOn ? '(ОФЛАЙН)' : ''}</span>
                    <div style="display:flex; gap:15px; align-items:center">
                        <i class="fa-solid ${batIcon} icon-btn" 
                           style="color:${s.isCharging ? 'var(--success)' : (s.battery < 20 ? 'var(--danger)' : '#888')}; font-size:1rem;"
                           title="Зарядка"
                           onclick="event.stopPropagation(); toggleCharging(${s.id})"></i>
                        <i class="fa-solid fa-power-off icon-btn" 
                           style="color:${s.isOn ? 'var(--success)' : '#555'}; font-size:1.1rem;"
                           title="Живлення"
                           onclick="event.stopPropagation(); togglePower(${s.id})"></i>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                    <span style="font-size:1.5rem; font-weight:bold; color:${s.isOn ? getColorForTemp(s.temp) : '#555'}">
                        ${s.isRebooting ? '--' : (s.isOn ? s.temp + '°C' : 'OFF')}
                    </span>
                    <div style="display: flex; gap: 15px;">
                        <span style="color:${s.isOn ? '#fcd34d' : '#555'};"><i class="fa-solid fa-smog"></i> ${s.isRebooting || !s.isOn ? '--' : s.aqi}</span>
                        <span style="color:${s.isOn ? '#00d4ff' : '#555'};"><i class="fa-solid fa-droplet"></i> ${s.isRebooting || !s.isOn ? '--' : s.humidity + '%'}</span>
                    </div>
                </div>
                <div style="margin-top:12px; display:flex; gap:8px;">
                    <button class="btn-action" onclick="remoteReboot(${s.id})" ${!s.isOn ? 'disabled style="opacity:0.5;"' : ''}>Restart</button>
                    <button class="btn-action" onclick="logEvent('Ping: ${s.name} OK')" ${!s.isOn ? 'disabled style="opacity:0.5;"' : ''}>Ping</button>
                    <button class="btn-action" style="margin-left:auto; color:var(--accent)" onclick="event.stopPropagation(); openDetailsTab(${s.id})">Деталі <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            `;
            container.appendChild(card);
        }

        if (!s.isRebooting && s.isOn) {
            markers[s.id].setStyle({ fillColor: getColorForTemp(s.temp), color: '#121212' }); 
            markers[s.id].setPopupContent(`<b>${s.name}</b><br>T: ${s.temp}°C | Вологість: ${s.humidity}% | AQI: ${s.aqi} | Радіація: ${s.radiation} мкР/год`);
            
            if (s.temp >= 30) {
                if(!mapCircles[s.id]) {
                    const icon = L.divIcon({ className: 'radar-pulse', iconSize: [16, 16], iconAnchor: [8, 8] });
                    mapCircles[s.id] = L.marker([s.lat, s.lng], { icon: icon, interactive: false }).addTo(map);
                }
            } else if(mapCircles[s.id]) {
                map.removeLayer(mapCircles[s.id]);
                delete mapCircles[s.id];
            }
        } else if (!s.isOn) {
            markers[s.id].setStyle({ fillColor: '#555', color: '#333' }); 
            markers[s.id].setPopupContent(`<b>${s.name}</b><br>ОФЛАЙН`);
            if(mapCircles[s.id]) { map.removeLayer(mapCircles[s.id]); delete mapCircles[s.id]; }
        }
        
        const originalIndex = stationsData.findIndex(st => st.id === s.id);
        if(originalIndex !== -1) chart.data.datasets[originalIndex].data = s.history;
    });
    
    if(!forceUpdate) chart.update();

    document.getElementById('active-nodes').innerText = stationsData.filter(s => !s.isRebooting && s.isOn).length;
    const activeStations = stationsData.filter(s => s.isOn);
    document.getElementById('avg-temp').innerText = activeStations.length > 0 ? (activeStations.reduce((sum, s) => sum + s.temp, 0) / activeStations.length).toFixed(1) : 0;
    document.getElementById('critical-nodes').innerText = stationsData.filter(s => s.isOn && (s.temp >= 30 || s.temp < -5 || s.aqi > 150 || s.radiation > 30)).length;
}

function openModal(id) {
    const s = stationsData.find(x => x.id === id);
    if (!s) return;
    
    document.getElementById('modalTitle').innerText = s.name + " - Сенсор #" + s.id + (s.isOn ? "" : " (ОФЛАЙН)");
    document.getElementById('modalWind').innerText = s.isOn ? (s.windSpeed + " м/с") : "--";
    document.getElementById('modalPressure').innerText = s.isOn ? ((1013 + (Math.random()*10-5)).toFixed(0) + " hPa") : "--";
    document.getElementById('modalRain').innerText = s.isOn ? ((Math.random() > 0.7 ? (Math.random()*2).toFixed(1) : "0") + " мм") : "--";
    document.getElementById('modalAQI').innerText = s.isOn ? (s.aqi + (s.aqi > 100 ? " (Погано)" : " (В нормі)")) : "--";
    document.getElementById('modalRadiation').innerText = s.isOn ? (s.radiation + " мкР/год") : "--";
    
    document.getElementById('modalBatteryText').innerText = s.battery.toFixed(0) + "%";
    const fill = document.getElementById('modalBatteryFill');
    fill.style.width = s.battery + "%";
    fill.style.backgroundColor = s.battery < 20 ? 'var(--danger)' : 'var(--success)';

    document.getElementById('modalLog').innerHTML = s.events.map(e => `<div class="station-log-item">${e}</div>`).join('');
    document.getElementById('sensorModal').style.display = 'flex';
}

function closeModal() { document.getElementById('sensorModal').style.display = 'none'; }

function initChartMenu() {
    const menu = document.getElementById('chartMenu');
    stationsData.forEach((s, index) => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `<input type="checkbox" id="chk-${index}" ${index < 5 ? 'checked' : ''} onchange="toggleDataset(${index})"><label for="chk-${index}">${s.name}</label>`;
        menu.appendChild(div);
    });
}

function toggleChartMenu() { document.getElementById('chartMenu').classList.toggle('show'); }

function toggleDataset(index) {
    if (chart.isDatasetVisible(index)) chart.hide(index);
    else chart.show(index);
}

function initStationSelector() {
    const select = document.getElementById('stationSelect');
    stationsData.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id; opt.innerText = s.name;
        select.appendChild(opt);
    });
}

function remoteReboot(id) {
    const s = stationsData.find(x => x.id === id);
    if (s.isRebooting || !s.isOn) return;
    s.isRebooting = true;
    s.addEvent("Відправлено команду REBOOT");
    simulationLoop(true);
    setTimeout(() => {
        s.isRebooting = false; s.addEvent("Система успішно перезапущена"); s.history = []; 
    }, 4000);
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>${msg}</span>`;
    container.appendChild(t); setTimeout(() => t.remove(), 4500);
}

function saveData() {
    let csv = "\uFEFFID,Назва станції,Статус,Температура(C),Вологість(%),AQI,Радіація(мкР/год),Вітер(м/с),Батарея(%),Час запису\n";
    stationsData.forEach(s => {
        csv += `${s.id},${s.name},${s.isOn ? "Увімкнено" : "Вимкнено"},${s.isOn ? s.temp : '--'},${s.isOn ? s.humidity : '--'},${s.isOn ? s.aqi : '--'},${s.isOn ? s.radiation : '--'},${s.isOn ? s.windSpeed : '--'},${s.battery.toFixed(0)},${new Date().toLocaleTimeString('uk-UA')}\n`;
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = `Report_TA33_Gutsol.csv`; link.click();
}

function logEvent(m) {
    const l = document.getElementById('system-logs');
    const div = document.createElement('div');
    div.className = 'log-entry'; div.innerHTML = `<span style="color:#666">[${new Date().toLocaleTimeString()}]</span> ${m}`;
    l.prepend(div); if (l.children.length > 50) l.lastChild.remove();
}

function generateClouds() {
    const c = document.getElementById('clouds');
    for(let i=0; i<8; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        const s = Math.random() * 100 + 50;
        cloud.style.width = s + 'px'; cloud.style.height = (s/2) + 'px';
        cloud.style.top = Math.random() * 100 + '%';
        cloud.style.animationDuration = (Math.random() * 15 + 10) + 's';
        cloud.style.animationDelay = (Math.random() * 5) + 's';
        c.appendChild(cloud);
    }
}

function initMap() {
    map = L.map('map', { center: [48.3794, 31.1656], zoom: 5, minZoom: 5, maxBounds: L.latLngBounds(L.latLng(43.0, 21.0), L.latLng(53.0, 41.0)), maxBoundsViscosity: 1.0 });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    stationsData.forEach(s => {
        markers[s.id] = L.circleMarker([s.lat, s.lng], { radius: 8, fillColor: getColorForTemp(s.temp), color: "#121212", weight: 2, opacity: 1, fillOpacity: 0.8 }).addTo(map).bindPopup(`<b>${s.name}</b><br>T: ${s.temp}°C | Вологість: ${s.humidity}%`);
    });
}

function initChart() {
    const palette = ['#a78bfa', '#60a5fa', '#34d399', '#fcd34d', '#f87171', '#818cf8', '#fbbf24', '#A0E7E5'];
    chart = new Chart(document.getElementById('tempChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: stationsData.map((s, index) => ({ label: s.name, data: [], borderColor: palette[index % palette.length], borderWidth: 3, tension: 0.4, pointRadius: 0, hidden: index >= 5 }))
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { color: '#e0e0e0', boxWidth: 12, padding: 15, font: { size: 11 } } } }, scales: { y: { grid: { color: '#333' }, ticks: { color: '#aaa', font: { size: 10 } }, min: -10, max: 45 }, x: { display: false } }, animation: { duration: 0 } }
    });
}

function updateForecast() {
    const select = document.getElementById('stationSelect');
    const station = stationsData.find(s => s.id === (select.value ? parseInt(select.value) : 1)) || stationsData[0];
    const weatherIcons = ['<i class="fa-solid fa-sun" style="color: #ffcc00;"></i>', '<i class="fa-solid fa-cloud" style="color: #999;"></i>', '<i class="fa-solid fa-cloud-rain" style="color: #00d4ff;"></i>'];
    document.getElementById('forecast-container').innerHTML = ["Сьогодні", "Завтра", "Післязавтра"].map((d) => `
        <div class="forecast-item">
            <span class="day-name">${d}</span>
            <div style="display: flex; align-items: center; gap: 10px;">
                ${weatherIcons[Math.floor(Math.random() * weatherIcons.length)]}
                <span style="color:var(--accent); font-weight:bold;">${(station.temp + (Math.random() * 6 - 3)).toFixed(1)}°C</span>
            </div>
        </div>
    `).join('');
}

function startClock() { setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('uk-UA'); }, 1000); }

function openPhotoModal(stationId) {
    const s = stationsData.find(x => x.id === stationId);
    if (!s) return;

    const modal = document.getElementById('photoModal');
    const img = document.getElementById('stationPhoto');
    const title = document.getElementById('photoModalTitle');
    const desc = document.getElementById('photoDesc');

    title.innerText = `Об'єкт: ${s.name}`;
    img.src = `https://loremflickr.com/600/400/city,building?lock=${s.id}`;
    desc.innerText = `Візуалізація інфраструктурного вузла в місті ${s.name}. Координати: ${s.lat}, ${s.lng}`;
    
    modal.style.display = 'flex';
}

function closePhotoModal() {
    document.getElementById('photoModal').style.display = 'none';
}
async function updateCurrencyRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/UAH');
        const data = await response.json();
        const usdRate = (1 / data.rates.USD).toFixed(2);
        logEvent(`Курс оновлено: 1 USD = ${usdRate} UAH (використано fetch)`);
    } catch (error) {
        console.error("Помилка завантаження валют:", error);
    }
}

function getNetworkAnalytics() {
    
    const critical = stationsData.filter(s => s.temp > 35 || s.battery < 20);
    
    const activeCityNames = stationsData
        .filter(s => s.isOn)
        .map(s => s.name);
        
    const totalBattery = stationsData.reduce((sum, s) => sum + s.battery, 0);
    const avgBattery = (totalBattery / stationsData.length).toFixed(1);

    console.log("Аналітика:", { critical, activeCityNames, avgBattery });
    logEvent(`Мережа: Середній заряд батарей по системі: ${avgBattery}%`);
}

async function runSystemDiagnostic(id) {
    const s = stationsData.find(x => x.id === id);
    if (!s) return;

    logEvent(`🚀 Початок повної діагностики вузла [${s.name}]...`);
    s.isRebooting = true; 
    simulationLoop(true);

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    try {
        await delay(1500);
        logEvent(`🔍 [${s.name}]: Перевірка цілісності БД... OK`);
        
        await delay(1500);
        logEvent(`📡 [${s.name}]: Тестування LoRa-зв'язку... OK`);
        
        await delay(1000);
        s.battery = 100; // Імітую "калібрування" батареї
        logEvent(`🔋 [${s.name}]: Калібрування живлення завершено.`);
    } catch (e) {
        logEvent(`❌ Помилка діагностики вузла ${s.name}`);
    } finally {
        s.isRebooting = false;
        logEvent(`✅ Діагностика вузла [${s.name}] завершена успішно.`);
        simulationLoop(true);
    }
}

let autoLogCounter = 0;
const statusTimer = setInterval(() => {
    autoLogCounter++;
    const activeCount = stationsData.filter(s => s.isOn).length;
    if (autoLogCounter % 5 === 0) { 
        logEvent(`📊 Авто-звіт: Системний аптайм в нормі. Вузлів онлайн: ${activeCount}`);
    }
}, 2000);

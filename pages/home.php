<div class="toast-container" id="toast-container"></div>

<div id="sensorModal" class="modal-backdrop" onclick="if(event.target === this) closeModal()">
    <div class="modal-content">
        <span class="modal-close" onclick="closeModal()">&times;</span>
        <h2 id="modalTitle" style="color: var(--accent); margin-top: 0;">Station Name</h2>
        
        <div class="detail-row">
            <span><i class="fa-solid fa-wind"></i> Швидкість вітру</span>
            <span id="modalWind">0 м/с</span>
        </div>
        <div class="detail-row">
            <span><i class="fa-solid fa-gauge-high"></i> Атмосферний тиск</span>
            <span id="modalPressure">1013 hPa</span>
        </div>
        <div class="detail-row">
            <span><i class="fa-solid fa-cloud-rain"></i> Опади (1г)</span>
            <span id="modalRain">0 мм</span>
        </div>
        <div class="detail-row">
            <span><i class="fa-solid fa-smog"></i> Якість повітря (AQI)</span>
            <span id="modalAQI">15</span>
        </div>
        <div class="detail-row">
            <span><i class="fa-solid fa-radiation"></i> Радіаційний фон</span>
            <span id="modalRadiation">12 мкР/год</span>
        </div>
        
        <div style="margin-top: 20px;">
            <div style="display:flex; justify-content:space-between; font-size:0.9rem; color:#aaa;">
                <span>Заряд батареї IoT модуля</span>
                <span id="modalBatteryText">100%</span>
            </div>
            <div class="battery-level"><div id="modalBatteryFill" class="battery-fill" style="width: 100%;"></div></div>
        </div>

        <div style="margin-top: 15px; color: var(--accent); font-size: 0.85rem; font-weight: bold;">Останні події:</div>
        <div id="modalLog" class="station-log"></div>
        
        <button class="btn-save" style="width: 100%; margin-top: 20px; justify-content: center;" onclick="closeModal()">Закрити</button>
    </div>
</div>

<div class="dashboard-grid">
    <header>
        <div class="student-info">
            <h1><i class="fa-solid fa-microchip"></i> Smart City IoT Monitor</h1>
            <p>Лабораторна робота | 3 курс | ТА-33 | <b>Гуцол Олександра</b></p>
        </div>
        
        <div style="display:flex; gap:20px; align-items:center; flex-wrap: wrap; justify-content: center;">
            <button class="btn-save" onclick="saveData()">
                <i class="fa-solid fa-file-excel"></i> Експорт даних
            </button>
            <div id="clock" style="font-family:monospace; font-size:1.1rem; letter-spacing:1px;"></div>
        </div>
    </header>

    <div id="map-container">
        <div id="map"></div>
        <div class="clouds-overlay" id="clouds"></div>
    </div>

    <div class="sidebar">
        <div class="search-area">
            <div class="search-input-wrapper">
                <i class="fa-solid fa-magnifying-glass" style="color:#555"></i>
                <input type="text" id="searchBox" placeholder="Пошук..." onkeyup="filterStations()">
            </div>
            <div class="search-input-wrapper">
                <i class="fa-solid fa-filter" style="color:#555"></i>
                <select id="sortBox" onchange="simulationLoop(true)">
                    <option value="default">Сортування: За замовчуванням</option>
                    <option value="tempDesc">Температура: Гарячі спочатку</option>
                    <option value="tempAsc">Температура: Холодні спочатку</option>
                    <option value="name">За назвою (А-Я)</option>
                </select>
            </div>
        </div>
        <div id="cards-container"></div>
    </div>

    <div class="global-stats-container">
        <div class="stats-info-group">
            <div><i class="fa-solid fa-tower-cell" style="color: var(--success)"></i> Активних вузлів: <b id="active-nodes">25</b>/25</div>
            <div><i class="fa-solid fa-temperature-half" style="color: var(--warning)"></i> Середня t°: <b id="avg-temp">0</b>°C</div>
            <div><i class="fa-solid fa-triangle-exclamation" style="color: var(--danger)"></i> Критичних: <b id="critical-nodes">0</b></div>
        </div>
        <div class="stats-btn-group">
            <button class="btn-global btn-on-all" onclick="turnOnAll()"><i class="fa-solid fa-power-off"></i> Увімкнути всі</button>
            <button class="btn-global btn-off-all" onclick="turnOffAll()"><i class="fa-solid fa-power-off"></i> Вимкнути всі</button>
            <button class="btn-global btn-panic" onclick="triggerPanic()"><i class="fa-solid fa-skull-crossbones"></i> Збій мережі</button>
        </div>
    </div>

    <div class="analytics-panel">
        <div class="panel-box">
            <div class="chart-header">
                <span style="font-weight:bold; color:#888;">Температурні тренди</span>
                <button class="chart-settings-btn" onclick="toggleChartMenu()"><i class="fa-solid fa-gear"></i> Вибрати міста</button>
            </div>
            
            <div id="chartMenu" class="chart-dropdown"></div>

            <div class="chart-wrapper">
                <canvas id="tempChart"></canvas>
            </div>
        </div>
        
        <div class="panel-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">
                <span style="font-size:0.85rem; color:#888;"><i class="fa-solid fa-wand-magic-sparkles"></i> AI ПРОГНОЗ</span>
                <select id="stationSelect" onchange="updateForecast()"></select>
            </div>
            <div id="forecast-container"></div>
        </div>

        <div class="panel-box log-terminal" id="system-logs"></div>
    </div>
</div>

<div id="photoModal" class="modal-backdrop" onclick="if(event.target === this) closePhotoModal()">
    <div class="modal-content" style="max-width: 600px; text-align: center;">
        <span class="modal-close" onclick="closePhotoModal()">&times;</span>
        <h2 id="photoModalTitle" style="color: var(--accent); margin-top: 0;">Фото об'єкта</h2>
        
        <div style="position: relative; min-height: 200px;">
            <img id="stationPhoto" src="" alt="IoT Station" style="width: 100%; border-radius: 10px; border: 1px solid #444; margin: 15px 0;">
        </div>
        
        <p id="photoDesc" style="color: #aaa; font-size: 0.9rem; line-height: 1.4;"></p>
        
        <button class="btn-save" style="width: 100%; justify-content: center; margin-top: 10px;" onclick="closePhotoModal()">
            Зрозуміло
        </button>
    </div>
</div>
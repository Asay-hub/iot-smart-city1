<?php
// Визначаємо поточну сторінку з GET параметра (за замовчуванням 'home')
$page = isset($_GET['page']) ? $_GET['page'] : 'home';

// Масив дозволених сторінок (для безпеки, щоб не підключили сторонні файли)
$allowed_pages = ['home', 'services', 'contacts'];

// Якщо користувач ввів неіснуючу сторінку - кидаємо його на головну
if (!in_array($page, $allowed_pages)) {
    $page = 'home';
}
?>
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart City IoT - <?= ucfirst($page) ?></title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <?php if($page == 'home'): ?>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <?php endif; ?>
    
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <nav class="main-nav">
        <div class="nav-brand"><i class="fa-solid fa-satellite-dish"></i> IoT System</div>
        <ul class="nav-links">
            <li><a href="index.php?page=home" class="<?= ($page == 'home') ? 'active' : '' ?>">Головна (Дашборд)</a></li>
            <li><a href="index.php?page=services" class="<?= ($page == 'services') ? 'active' : '' ?>">Обладнання та Послуги</a></li>
            <li><a href="index.php?page=contacts" class="<?= ($page == 'contacts') ? 'active' : '' ?>">Контакти</a></li>
        </ul>
    </nav>

    <main id="content">
        <?php
            // Підключаємо файл залежно від параметра GET
            include("pages/{$page}.php");
        ?>
    </main>

    <?php if($page == 'home'): ?>
        <script src="script.js"></script>
    <?php endif; ?>

    <?php if($page == 'services'): ?>
        <script src="cart.js"></script>
    <?php endif; ?>

</body>
</html>
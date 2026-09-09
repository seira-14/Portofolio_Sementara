<?php
// Set header untuk JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once 'config.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Method tidak diizinkan. Gunakan POST.'
    ]);
    exit;
}

// Sanitize and validate input
$fullname = trim(filter_input(INPUT_POST, 'fullname', FILTER_SANITIZE_STRING));
$email = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$subject = trim(filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING));
$message = trim(filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING));

// Validation
$errors = [];

if (empty($fullname)) {
    $errors[] = 'Nama lengkap wajib diisi';
}

if (empty($email)) {
    $errors[] = 'Email wajib diisi';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Format email tidak valid';
}

if (empty($subject)) {
    $errors[] = 'Subjek wajib diisi';
}

if (empty($message)) {
    $errors[] = 'Pesan wajib diisi';
}

// If validation fails
if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'message' => implode(', ', $errors)
    ]);
    exit;
}

try {
    // Prepare SQL statement
    $sql = "INSERT INTO contact_messages (fullname, email, subject, message, created_at) 
            VALUES (:fullname, :email, :subject, :message, NOW())";
    
    $stmt = $pdo->prepare($sql);
    
    // Bind parameters
    $stmt->bindParam(':fullname', $fullname, PDO::PARAM_STR);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->bindParam(':subject', $subject, PDO::PARAM_STR);
    $stmt->bindParam(':message', $message, PDO::PARAM_STR);
    
    // Execute statement
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Pesan Anda berhasil dikirim! Terima kasih sudah menghubungi saya!.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Gagal menyimpan pesan. Silakan coba lagi.'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan database: ' . $e->getMessage()
    ]);
}

// Close connection
$pdo = null;
?>
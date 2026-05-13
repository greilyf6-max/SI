<?php
$servidor = "localhost";
$usuario = "root";
$contrasena = "";
$basedatos = "tienda_online";

$conexion = new mysqli($servidor, $usuario, $contrasena, $basedatos);

if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}
echo"Conexión exitosa a la base de datos.";
?>
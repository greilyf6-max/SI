<?php
// Configuración de la conexión
$host = "localhost";
$user = "root";
$pass = "";
$db   = "tienda_online";

$conexion = mysqli_connect($host, $user, $pass, $db);

if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre    = $_POST['nombre_producto'];
    $desc      = $_POST['descripcion'];
    $precio    = $_POST['precio'];
    $stock     = $_POST['stock'];
    $categoria = $_POST['id_categoria'];
    $imagen    = $_POST['imagen_url'];
<div class="mb-3">
    <label class="form-label">Categoría del Producto</label>
    <select name="id_categoria" class="form-select" required>
        <option value="">Seleccione una categoría...</option>
        
           

        // 2. Consultar las categorías existentes
        $query = "SELECT id_categoria, nombre_categoria FROM categorias ORDER BY nombre_categoria ASC";
        $resultado = mysqli_query($conexion, $query);

        // 3. Verificar si hay resultados y recorrerlos
        if (mysqli_num_rows($resultado) > 0) {
            while ($fila = mysqli_fetch_assoc($resultado)) {
                // El 'value' es lo que se guarda en la DB (ID), 
                // lo que está entre etiquetas es lo que el usuario ve (Nombre).
                echo '<option value="' . $fila['id_categoria'] . '">' . $fila['nombre_categoria'] . '</option>';
            }
        } else {
            echo '<option value="">No hay categorías disponibles</option>';
        }

        // 4. Cerrar la conexión temporal
        mysqli_close($conexion);
        
        
    </select>
    <div class="form-text">Si no ves categorías, asegúrate de haberlas insertado en la base de datos.</div>
</div>
    $sql = "INSERT INTO productos (nombre_producto, descripcion, precio, stock, id_categoria, imagen_url) 
            VALUES ('$nombre', '$desc', '$precio', '$stock', '$categoria', '$imagen')";

    if (mysqli_query($conexion, $sql)) {
        echo "<script>alert('Producto registrado con éxito'); window.location='formulario.php';</script>";
    } else {
        echo "Error: " . $sql . "<br>" . mysqli_error($conexion);
    }
}
mysqli_close($conexion);
?>
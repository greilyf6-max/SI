let indice = 0;

function moverCarrusel() {
  const carrusel = document.getElementById("carrusel");

  if (!carrusel) return;

  const total = carrusel.children.length;

  indice++;

  if (indice >= total) {
    indice = 0;
  }

  carrusel.style.transform = `translateX(-${indice * 100}%)`;
}

setInterval(moverCarrusel, 3000);
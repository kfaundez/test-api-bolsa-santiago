//Mientras no carge la pagina no se ejecuta nada de lo siguiente
window.onload = () => {
  //Se rescata la información del token y se consume api al hacer click
  const inputToken = document.getElementById('token')
  const botonToken = document.getElementById('btn-token')
  botonToken.addEventListener('click', () => {
    if (inputToken.value !== '') {
      consumirAPI('https://startup.bolsadesantiago.com/api/consulta/TickerOnDemand/getIndices?access_token=' + inputToken.value)
    } else {
      alert('No se puede utilizar un token vacío')
    }
  })
}

// Se ejecuta fech para obtener datos de api
function consumirAPI(url) {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then(async response => {
      const listaIndices = await response.json()
      if ('listaResult' in listaIndices) {
        inicializacion(listaIndices.listaResult)
      } else {
        inicializacion([])
      }
    }).catch(error => {
      console.log('Hubo un problema con la petición Fetch:' + error.message)
    })
}

function inicializacion(listaIndices) {
  // Inicialización de variables
  const labels = []
  const valorActualGrafico = []
  const valorMinimoGrafico = []
  const valorMaximoGrafico = []
  const variacionGrafico = []
  const botonValores = document.getElementById('btn-valores')
  const botonVariacion = document.getElementById('btn-variacion')
  const tabla = document.getElementById('tabla')

  //En caso que la tabla tenga datos residuales estos son eliminados
  while (tabla.firstChild) {
    tabla.removeChild(tabla.lastChild);
  }

  //Ingreso de datos a la tabla y rescato de información
  listaIndices.forEach((elemento, index) => {
    tabla.appendChild(crearFila(elemento, index))
    labels.push(elemento.Nombre)
    valorActualGrafico.push(elemento.Valor)
    valorMinimoGrafico.push(elemento.Menor)
    valorMaximoGrafico.push(elemento.Mayor)
    variacionGrafico.push(elemento.Variacion)
  })

  // Proceso de datos para grafico
  const informacionGraficoTipo1 = [
    {
      color: 'rgba(75, 192, 192, 0.2)',
      borde: 'rgb(75, 192, 192)',
      nombre: 'Valor mínimo',
      datos: valorMinimoGrafico
    },
    {
      color: 'rgba(54, 162, 235, 0.2)',
      borde: 'rgb(54, 162, 235)',
      nombre: 'Valor actual',
      datos: valorActualGrafico
    },
    {
      color: 'rgba(153, 102, 255, 0.2)',
      borde: 'rgb(153, 102, 255)',
      nombre: 'Valor máximo',
      datos: valorMaximoGrafico
    }
  ]

  const informacionGraficoTipo2 = [
    {
      color: 'rgba(255, 159, 64, 0.2)',
      borde: 'rgb(255, 159, 64)',
      nombre: 'Variación',
      datos: variacionGrafico
    },
  ]

  // Se crea el gráfico dependiendo de lo que presione
  crearGrafico(procesarDatos(informacionGraficoTipo1, labels))

  botonValores.addEventListener('click', () => {
    crearGrafico(procesarDatos(informacionGraficoTipo1, labels))
    botonVariacion.classList.remove('active')
    botonValores.classList.add('active')
  })

  botonVariacion.addEventListener('click', () => {
    crearGrafico(procesarDatos(informacionGraficoTipo2, labels))
    botonValores.classList.remove('active')
    botonVariacion.classList.add('active')
  })
}

// Modifica el model dependiendo de que indice presiona
function modificarModal(indice) {
  const myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false
  })
  const tituloModal = document.getElementById('exampleModalLabel')
  tituloModal.innerText = indice.Nombre

  const contenidoModal = document.getElementById('contenido-modal')
  contenidoModal.innerHTML = `<ul><li>Valor actual: ${indice.Valor}</li><li>Valor máximo: ${indice.Mayor}</li><li>Valor mínimo: ${indice.Menor}</li><li>Valor medio: ${indice.Medio}</li><li>Variación: ${indice.Variacion}%</li></ul>`
  myModal.toggle()
}

// Crea una fila de la tabla con la información de un indice
function crearFila(indice, index) {
  const fila = document.createElement('tr')
  const columna1 = document.createElement('th')
  columna1.setAttribute("scope", "row")
  columna1.innerText = index + 1
  const columna2 = document.createElement('td')
  columna2.innerText = indice.Nombre
  const columna3 = document.createElement('td')
  columna3.innerText = indice.Valor
  const columna4 = document.createElement('td')
  columna4.innerText = indice.Variacion + '%'
  const columna5 = document.createElement('td')
  const boton = document.createElement('button')
  boton.setAttribute("type", "button")
  boton.classList.add("btn", "btn-primary")
  boton.innerText = "Detalles"
  boton.addEventListener('click', () => {
    modificarModal(indice)
  })
  columna5.appendChild(boton)
  fila.appendChild(columna1)
  fila.appendChild(columna2)
  fila.appendChild(columna3)
  fila.appendChild(columna4)
  fila.appendChild(columna5)
  return fila
}

// Se crea el grafico de barra
function crearGrafico(datos) {
  const config = {
    type: 'bar',
    data: datos,
    options: {}
  }

  const divGrafico = document.getElementById('grafico')
  
  while (divGrafico.firstChild) {
    divGrafico.removeChild(divGrafico.lastChild);
  }

  const canvas = document.createElement('canvas')
  
  divGrafico.appendChild(canvas)
  new Chart(
    canvas,
    config
  )
}

//Procesa los datos para que se puedan graficar
function procesarDatos(datos, labels) {
  const data = {
    labels: labels,
    datasets: []
  }
  datos.forEach(elemento => {
    data.datasets.push(
      {
        label: elemento.nombre,
        backgroundColor: [
          elemento.color
        ],
        borderColor: [
          elemento.borde
        ],
        borderWidth: 1,
        data: elemento.datos,
      })
  })
  return data
}

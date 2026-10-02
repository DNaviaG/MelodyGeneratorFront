Melody Generator - Frontend

Aplicación web desarrollada con Angular 21 para generar, visualizar y reproducir melodías musicales.

Este frontend forma parte de la aplicación Melody Generator y se comunica con el backend mediante una API REST.

Descripción

La aplicación permite seleccionar una escala musical y solicitar al backend la generación de una melodía.

La melodía generada se muestra mediante un piano roll y puede reproducirse directamente desde la aplicación.

Funcionalidades actuales
Selección de escalas mayores y menores.
Generación de melodías mediante la API REST.
Visualización de las notas mediante un piano roll.
Reproducción de melodías mediante Tone.js.
Controles de reproducción.
Control de tempo.
Indicador de la nota que se está reproduciendo.
Pausa y reanudación de la reproducción.
Detención de la reproducción.
Reinicio de la melodía.
Diseño responsive para diferentes tamaños de pantalla.
Tecnologías
Angular 21
TypeScript
HTML
CSS
Bootstrap
Tone.js
Estructura del proyecto

El frontend está organizado por funcionalidades:

src/
└── app/
    ├── melody/
    ├── melody-player-service/
    ├── melody-service/
    ├── piano-roll-service/
    └── models/
Principales componentes
Melody: componente principal de la interfaz de generación y reproducción.
MelodyService: gestiona la comunicación con la API REST del backend.
MelodyPlayerService: gestiona la reproducción de las melodías mediante Tone.js.
PianoRollService: prepara la información necesaria para representar las notas en el piano roll.
Models: contiene las interfaces utilizadas para representar las melodías, escalas, compases y notas.
Comunicación con el backend

El frontend realiza peticiones HTTP al backend para generar nuevas melodías.

Endpoint utilizado:

POST /api/melody/generate

Ejemplo de petición:

{
  "rootNote": "C",
  "mode": "MAJOR"
}

La respuesta viene envuelta en la propiedad "melody":

{
  "melody": {
    "rootNote": "C",
    "mode": "MAJOR",
    "tempo": 120,
    "measures": []
  }
}

Ejecución
Requisitos
Node.js
npm
Angular CLI
Instalar dependencias

Desde la carpeta frontend:

npm install
Ejecutar el proyecto
ng serve

Una vez iniciado el servidor de desarrollo, la aplicación estará disponible en:

http://localhost:4200

La aplicación se recargará automáticamente al modificar los archivos del proyecto.

Construcción

Para generar una versión de producción:

ng build

Los archivos generados se almacenarán en el directorio dist/.

El frontend está integrado con el backend y permite completar el flujo principal de la aplicación: seleccionar una escala, generar una melodía, visualizarla y reproducirla.

Pendiente

La autenticación (registro, login y logout) y el guardado y carga de melodías todavía no están implementados.

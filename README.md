Proyecto para Curso Integrado II, V-LINK.

### 1. Clonar el repositorio

Para clonar el repositorio en tu máquina local, usa el siguiente comando en tu terminal:

```bash
git clone https://github.com/Estrada165/V-LINK.git
````

Esto descargará el proyecto en tu computadora y podrás empezar a trabajar con los archivos localmente.

### 2. Abrir el proyecto en Visual Studio Code

* Después de clonar el repositorio, abre **Visual Studio Code**.
* Haz clic en **File** (Archivo) y luego en **Open Folder** (Abrir Carpeta).
* Selecciona la carpeta `V-LINK` (o el nombre de tu repositorio) y ábrela.

Esto te permitirá trabajar en los archivos del proyecto desde Visual Studio Code.

### 3. Sincronización antes de trabajar

Antes de empezar a trabajar, asegúrate de tener la versión más reciente del proyecto. Para ello, debes ejecutar el siguiente comando en la terminal dentro de Visual Studio Code:

```bash
git pull origin main
```

Este comando descarga los cambios más recientes del repositorio y asegura que tu copia local esté actualizada. **Haz esto siempre antes de empezar a trabajar** para evitar conflictos y trabajar sobre la versión más actual.

### 4. Realizar cambios

Cuando hayas terminado de realizar los cambios necesarios en los archivos del proyecto, sigue estos pasos para registrar y subir esos cambios a GitHub.

#### 4.1. Agregar los archivos modificados

Para agregar todos los archivos modificados a la lista de cambios que quieres registrar, usa el siguiente comando:

```bash
git add .
```

Este comando agrega todos los archivos modificados. Si solo deseas agregar archivos específicos, puedes reemplazar el `.` con el nombre del archivo.

#### 4.2. Hacer un commit de los cambios

Después de agregar los archivos, debes registrar los cambios que has hecho con un mensaje descriptivo:

```bash
git commit -m "Descripción de los cambios realizados"
```

Asegúrate de que el mensaje del commit describa claramente los cambios que hiciste, por ejemplo: "Añadir nueva funcionalidad al frontend" o "Corregir error en la base de datos".

#### 4.3. Subir los cambios a GitHub

Finalmente, después de hacer el commit, sube tus cambios a GitHub para que todos los miembros del equipo puedan verlos y trabajar con la última versión:

```bash
git push origin main
```

Este comando sube tus cambios al repositorio en GitHub.

### 5. Sincronización con los cambios de los demás

Si otro miembro del equipo ha hecho cambios mientras trabajabas, es importante sincronizar tu repositorio local con los cambios más recientes antes de continuar trabajando.

Para hacerlo, usa el siguiente comando:

```bash
git pull origin main
```

Este comando traerá los cambios más recientes del repositorio de GitHub a tu copia local y los fusionará con tu trabajo actual.

---

### Resumen de los comandos

* **`git clone <enlace>`**: Clona el repositorio en tu máquina local.
* **`git pull origin main`**: Obtiene los cambios más recientes del repositorio de GitHub.
* **`git add .`**: Agrega todos los archivos modificados para ser registrados.
* **`git commit -m "mensaje"`**: Registra los cambios con un mensaje descriptivo.
* **`git push origin main`**: Sube tus cambios al repositorio de GitHub.

---

### Notas importantes

* Siempre haz **`git pull origin main`** antes de empezar a trabajar para asegurarte de que tienes la última versión del proyecto.
* Realiza **`git commit`** y **`git push`** frecuentemente para evitar perder cambios y mantener el repositorio actualizado.
* Si hay conflictos al hacer **`git pull`**, Git te pedirá que los resuelvas. Esto sucede cuando dos personas modifican las mismas líneas de un archivo.

```

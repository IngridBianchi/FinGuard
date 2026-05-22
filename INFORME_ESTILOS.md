# Informe Técnico: Resolución de Conflictos de Estilos CSS (Tailwind)

## 1. Descripción del Problema
El dashboard presentaba inconsistencias visuales graves, principalmente:
- **Falta de contraste**: Títulos como "Panel de Control" y "Performance del Modelo" eran ilegibles en modo claro.
- **Renderizado incorrecto**: El tema no cambiaba correctamente, el fondo se mantenía oscuro incluso en modo claro, y los estilos de Tailwind base no se aplicaban de forma consistente.
- **Errores de compilación**: Conflictos entre la configuración de Tailwind v3 y v4 en el proceso de build de Docker, resultando en clases utilitarias desconocidas (`bg-background`, `bg-slate-50`).

## 2. Síntomas Técnicos (Para el desarrollador Frontend)
Para un desarrollador Frontend, el comportamiento era desconcertante y se manifestaba de la siguiente manera:

1. **Clases presentes, estilos ausentes**: Al inspeccionar el DOM, las clases de Tailwind aparecían correctamente aplicadas en las etiquetas HTML. Sin embargo, en la pestaña "Styles", estas clases no tenían ninguna definición de CSS asociada. No estaban sobrescritas; simplemente no existían en la hoja de estilos generada.
2. **Conflicto de versiones**: El proyecto tenía instalado Tailwind v4, pero la configuración intentaba forzar una sintaxis de la v3. Esto causaba que el motor de PostCSS no supiera si usar el plugin antiguo (`tailwindcss`) o el nuevo (`@tailwindcss/postcss`).
3. **Persistencia de Caché en Build**: Docker/Next.js servían un bundle CSS antiguo. Esto ocurría porque Docker utilizaba capas de caché de `npm run build` y Next.js mantenía una caché interna (`.next/`) que mezclaba estilos obsoletos con los nuevos.

## 3. Objetivos
- Garantizar que el modo claro y oscuro sean distinguibles y accesibles.
- Eliminar conflictos entre la configuración de CSS y el motor de compilación de Next.js.
- Lograr una jerarquía visual clara y profesional.

## 4. Acciones Tomadas
1. **Estandarización de Tailwind (v4)**: Se eliminaron configuraciones híbridas v3/v4. Se adoptó una configuración limpia y compatible con Tailwind v4 mediante la directiva `@import "tailwindcss";` y el uso correcto de `postcss.config.mjs`.
2. **Limpieza de `globals.css`**: Se eliminaron variables CSS complejas que sobrescribían los estilos base y se implementó un sistema basado puramente en clases de utilidad.
3. **Refactorización de Layout**: Se forzó un color de fondo/texto base sólido mediante clases en `layout.tsx`.
4. **Reconstrucción Forzada**: Se eliminaron imágenes y contenedores Docker (`docker-compose down`) y se forzó un nuevo build (`--no-cache`) para limpiar cualquier caché persistente.

## 5. Archivos Relacionados (Código Final)

### `frontend/src/app/globals.css`
```css
@import "tailwindcss";

body {
  font-family: Arial, Helvetica, sans-serif;
}
```

### `frontend/src/app/layout.tsx` (Fragmento del body)
```tsx
<body className="h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    forcedTheme="light"
    enableSystem={false}
    disableTransitionOnChange
  >
    <Navbar />
    <main className="flex-grow">{children}</main>
  </ThemeProvider>
</body>
```

### `frontend/src/app/page.tsx` (Fragmento de Título)
```tsx
<h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
  Panel de Control
</h1>
```

### `frontend/postcss.config.mjs`
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

## 6. Notas para mantenimiento
1. **Colores**: Para cambiar colores en modo claro/oscuro, utiliza las clases utilitarias de Tailwind (`text-slate-900 dark:text-white`).
2. **PostCSS**: No añadas `tailwind.config.js`. Si necesitas extender colores o temas, hazlo directamente en `globals.css` siguiendo la sintaxis de variables CSS de Tailwind v4.
3. **Build**: Al ejecutar `docker-compose up -d --build`, se reconstruye completamente el entorno sin caché, garantizando que estos archivos son los que se sirven en el navegador.

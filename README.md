# Ciclica Local

Ciclica Local es una app desktop, local-first y privada por defecto que ayuda a entender cómo estás **ahora**, probar una acción posible y aprender si realmente te ayudó.

## Una sola vista

La aplicación no tiene navegación entre módulos ni un dashboard. La única superficie cambia según el momento:

1. **¿Cómo estás ahora?**
2. **Puede influir** — una lectura breve y prudente.
3. **Prueba ahora** — una única acción contextual.
4. **¿Te ayudó?** — bastante, un poco o no.

Todo aparece en la misma pantalla y está diseñado para caber en la ventana desktop sin recorrer varias secciones.

El check-in se abre temporalmente en un panel lateral y pregunta solo:

- qué pesa más;
- intensidad;
- contexto;
- tiempo disponible;
- una nota opcional.

## Menú secundario

El menú de tres puntos contiene únicamente tareas ocasionales:

- perfil y ciclo;
- Ollama/OpenAI;
- copiar un resumen para consulta;
- exportar datos;
- borrar datos.

No son vistas principales.

## Privacidad e IA

- Los registros se guardan en `localStorage` del dispositivo.
- No hay cuenta, analítica ni sincronización automática.
- Ollama permite inferencia local.
- OpenAI es opcional y requiere una decisión explícita.
- La app sigue funcionando mediante reglas locales sin IA.
- La exportación excluye la API key de OpenAI.

## Estructura técnica

- `src/components/NowView.js`: la única superficie de producto
- `src/components/CheckInPanel.js`: registro contextual lateral
- `src/domain/actions.js`: acciones, interpretación y aprendizaje
- `src/domain/cycle.js`: estimación cauta del ciclo
- `src/domain/report.js`: resumen para consulta
- `src/state/store.js`: persistencia y migración local
- `src/ui/handlers.js`: check-ins, feedback, ajustes y exportación

## Correr local

```bash
python3 -m http.server 4173
```

Abrir `http://localhost:4173`.

## Verificación

```bash
npm test
```

Comprobar manualmente:

1. abrir y cerrar el check-in;
2. guardar un momento;
3. ver lectura, acción y feedback en la misma pantalla;
4. registrar si ayudó;
5. abrir perfil e IA desde el menú;
6. copiar/exportar sin exponer credenciales;
7. revisar la consola del navegador.

# Ciclica Local

Ciclica Local es una app desktop, local-first y privada por defecto para consultar el ciclo y descubrir cambios personales con el menor esfuerzo posible.

## Una sola vista

La aplicación no tiene navegación entre módulos ni un dashboard. La única superficie mantiene visible el contexto valioso y cambia según el momento:

1. **Contexto del ciclo** — día estimado, fase y próxima menstruación.
2. **Lo que Ciclica está viendo** — el insight personal ocupa el centro e incluye la evidencia observada.
3. **Un momento** — cuando algo pesa ahora, un drawer pide foco, intensidad, contexto y tiempo; Ciclica responde con un plan concreto y pide feedback si ayudó.
4. **Registro de hoy** — como siempre, mejor o más difícil (combustible de evidencia, no el centro del producto).
5. **Cambios opcionales** — señal e intensidad solo cuando algo fue diferente.

Ciclica no presenta información general sobre fases como si fuera un insight. Si todavía no existe evidencia personal, lo dice claramente y explica qué relación está intentando observar.

Si falta la última fecha menstrual, la misma franja muestra claramente qué no puede estimarse y permite completarla sin ocultar el resto de la experiencia.

Todo aparece en la misma pantalla y está diseñado para caber en la ventana desktop sin recorrer varias secciones.

El check-in de demanda y el registro ligero viven en la vista principal. También incluye un acceso directo para marcar el inicio del periodo.

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
- `src/components/CheckInPanel.js`: drawer de demanda (momento → acción → feedback)
- `src/domain/actions.js`: acciones, interpretación y aprendizaje
- `src/domain/cycle.js`: estimación cauta del ciclo
- `src/domain/report.js`: resumen para consulta
- `src/state/store.js`: persistencia y migración local
- `src/ui/handlers.js`: check-in, registro diario, ajustes y exportación

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

# Ciclica Local

Ciclica Local es una app open source y local-first para tracking menstrual y salud ciclica.

## Principios

- Datos locales por defecto.
- Sin cuenta, nube ni analiticas.
- Arquitectura por componentes ES Modules.
- Motor deterministico para ciclo, sintomas, reportes y banderas rojas.
- Preparada para integrar IA local con llama.cpp/Ollama/Tauri.
- Lenguaje clinico actualizado: SOMP/SOP durante la transicion de nomenclatura.

## Estructura

- `src/components`: componentes de UI.
- `src/domain`: logica de ciclo, fechas y reportes.
- `src/state`: store local.
- `src/data`: labels y taxonomias.
- `src/ui`: handlers de interaccion.

## Correr local

```bash
python3 -m http.server 4173
```

Abrir `http://localhost:4173`.

# Ciclica Local

Ciclica Local es una app open source, local-first y privada por defecto para registrar tu ciclo, leer patrones útiles y preparar un resumen claro cuando quieras compartirlo con una profesional de salud.

La idea es simple: una sola vista principal para el día a día y tres rutas de apoyo para profundizar solo cuando hace falta.

## Qué resuelve

- **Registro diario rápido**: registrar dolor, energía, sueño, sangrado, ánimo y una nota privada en segundos.
- **Lectura útil del día**: convertir pocos datos en una hipótesis breve, humana y cauta.
- **Patrones que sí importan**: detectar repeticiones y señales que ayudan a entender cómo se comporta tu cuerpo.
- **Resumen para consulta**: exportar un texto limpio para llevar a una conversación profesional.
- **Transparencia del producto**: mostrar por qué la app funciona así y qué reglas están activas.

## Cómo está organizada

### 1. Hoy
La vista central. Aquí se entiende rápidamente:
- qué día es
- qué lectura local sugiere la app
- qué vale la pena observar hoy
- cómo registrar lo mínimo sin esfuerzo

Es la pantalla que debe sentirse más importante y más calmada.

### 2. Patrones
La vista de lectura temporal.
- muestra los últimos 28 días
- ayuda a ver intensidad y repeticiones
- convierte historial en señales útiles, no en ruido

### 3. Consulta
La vista para compartir.
- resume lo que llevas registrado
- evita diagnósticos automáticos
- está pensada para conversar con una profesional si lo necesitas

### 4. Transparencia
La vista de confianza.
- explica decisiones del producto
- muestra reglas y restricciones
- separa lo aplicado, lo planeado y lo bloqueado por seguridad

### 5. Ajustes / perfil
La capa opcional de configuración.
- fecha de última menstruación
- duración aproximada del ciclo
- regularidad
- contextos opcionales como SOMP/SOP, TDPM/PMDD, endometriosis o anticonceptivos

## Principios del producto

- **Local-first**: los datos viven en el dispositivo.
- **Privacidad por defecto**: no hay cuenta, nube ni analítica.
- **Lenguaje humano**: la app habla de patrones e hipótesis, no de certezas diagnósticas.
- **Nomenclatura cuidada**: se contempla la transición SOMP/SOP.
- **Una vista principal**: el foco está en Hoy; el resto apoya.

## Estructura técnica

- `src/components`: UI principal y vistas
- `src/domain`: lógica de ciclo, fechas y reportes
- `src/state`: store local y persistencia
- `src/data`: labels, taxonomías y navegación
- `src/ui`: handlers de interacción

## Correr local

```bash
python3 -m http.server 4173
```

Abrir:

```txt
http://localhost:4173
```

## Verificación

Antes de cambiar la estructura o el contenido, conviene ejecutar:

```bash
npm test
```

Si además quieres revisar la experiencia real, abre la app en navegador y prueba:
- la vista Hoy
- los tabs inferiores
- el onboarding opcional
- la exportación de resumen

## Objetivo visual

La interfaz busca sentirse como una app pocket:
- una sola superficie central
- navegación inferior discreta
- jerarquía clara
- aire visual
- lenguaje corto y útil

Nada debe parecer un dashboard de CRM.

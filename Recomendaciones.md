// Sincronizar memorias con Git (respaldo y portabilidad)
El README explica engram sync. Aunque trabajes en una sola PC, sincronizar las memorias en el repo de tu proyecto tiene ventajas:

Respaldo: si perdés la base de datos local (~/.engram/engram.db), podés recuperar las memorias desde Git.

Compartir contexto con colaboradores (si algún día trabajás en equipo).

Historial de decisiones asociado al código.

Configuración rápida:

bash

# Cada vez que completes una tarea importante
engram sync --export          # exporta nuevas memorias a .engram/chunks/
git add .engram && git commit -m "memoria: avance semana 2 modelos"
git push

# En otra máquina (o después de clonar el repo)
engram sync --import          # reconstruye la base local

// Usar mem_session_start y mem_session_end para marcar bloques de trabajo
El README lista estas herramientas. Son muy poderosas para que Engram entienda el contexto temporal.

Flujo recomendado con Cursor:

Al comenzar una sesión de desarrollo (ej. "voy a implementar el endpoint /analyze de FastAPI"), pedile a la IA:

text
Usá mem_session_start con título "Implementación endpoint /analyze" y proyecto finguard.
Durante la sesión, cada vez que tomes una decisión importante (ej. "usamos Isolation Forest con contaminación=0.05"), pedí:

text
mem_save con tipo "decisión" y referencia a la sesión actual.
Al terminar (o al hacer pausa larga):

text
mem_session_end con un breve resumen de lo logrado.
Luego, cuando inicies una nueva sesión, podés pedir:

text
mem_session_start --previous-session-id <id> --resume
O simplemente mem_context te mostrará la última sesión activa.

//Usar engram serve para consultar memorias desde scripts o terminal
Si querés automatizar la consulta de memorias (por ejemplo, para mostrarlas en un dashboard personal), podés levantar el servidor HTTP:

bash
engram serve --port 7437
Luego, desde cualquier script o desde el navegador podés hacer:

text
http://localhost:7437/search?q=Isolation+Forest&project=finguard
Esto es más avanzado, pero muy útil si querés integrar las memorias con otras herramientas.


# 🃏 Card Sudoku 4×4

Juego de solitario tipo puzzle con cartas, estilo Sudoku 4×4.

---

## 🔹 Descripción

Card Sudoku es un juego web donde debes organizar 16 cartas en una cuadrícula 4×4 cumpliendo las reglas del Sudoku:  
- Cada fila y columna no puede repetir ni rango ni palo.  
- Solo las **diagonales grandes** deben cumplir la regla de no repetir rango ni palo; en las diagonales pequeñas se pueden repetir.  
- Se puede jugar en móvil y escritorio.  

El juego incluye:  
- Selección de cartas con **click/tap** y swap animado.  
- **Drag and drop** en móvil y escritorio.  
- Validación de la solución.  
- Animaciones profesionales y minimalistas para selección e intercambio.  

---

## 🔹 Tecnologías usadas

- **HTML5** + **Web Components** (`playing-card` de Cardmeister).  
- **CSS moderno**: Grid, Flex, `clamp()`, `svh`, `aspect-ratio`.  
- **JavaScript ES6+**: lógica del juego, animaciones, drag & drop, validación de Sudoku.  
- Compatible con móviles y escritorio, optimizado para **modo vertical** en móvil.  

---

## 🔹 Normas de juego

1. No repetir rango (A, J, Q, K) en la misma fila, columna o diagonal grande.  
2. No repetir palo (♠, ♥, ♦, ♣) en la misma fila, columna o diagonal grande.  
3. Se puede intercambiar cartas haciendo click en dos cartas o arrastrando una sobre otra.  
4. Pulsa **Validar** para comprobar si la solución es correcta.

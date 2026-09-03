
    class EfectosSonido {
      constructor() {
        this.ctx = null;
      }

      inicializar() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContext();
        }
      }

      reproducirDisparo() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const ganancia = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.12);
        ganancia.gain.setValueAtTime(0.3, this.ctx.currentTime);
        ganancia.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(ganancia);
        ganancia.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      }

      reproducirExplosion() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const ganancia = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);
        ganancia.gain.setValueAtTime(0.4, this.ctx.currentTime);
        ganancia.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(ganancia);
        ganancia.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
      }

      reproducirSalto() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const ganancia = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.15);
        ganancia.gain.setValueAtTime(0.2, this.ctx.currentTime);
        ganancia.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(ganancia);
        ganancia.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      }

      reproducirPotenciador() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const ganancia = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.25);
        ganancia.gain.setValueAtTime(0.3, this.ctx.currentTime);
        ganancia.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(ganancia);
        ganancia.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      }
    }

    const sonido = new EfectosSonido();

    const lienzo = document.getElementById('lienzoJuego');
    const ctx = lienzo.getContext('2d');

    const ANCHO_VISTA = 960;
    const ALTO_VISTA = 540;

    function redimensionarLienzo() {
      const anchoVentana = window.innerWidth;
      const altoVentana = window.innerHeight;
      const aspect = ANCHO_VISTA / ALTO_VISTA;

      let ancho = anchoVentana;
      let alto = anchoVentana / aspect;

      if (alto > altoVentana) {
        alto = altoVentana;
        ancho = alto * aspect;
      }

      lienzo.width = ANCHO_VISTA;
      lienzo.height = ALTO_VISTA;
      lienzo.style.width = `${ancho}px`;
      lienzo.style.height = `${alto}px`;
    }
    window.addEventListener('resize', redimensionarLienzo);
    redimensionarLienzo();

    let estadoJuego = 'MENU';
    let puntuacion = 0;
    let camaraX = 0;
    const SUELO_Y = 440;

    const teclas = { derecha: false, izquierda: false, arriba: false, abajo: false, salto: false, disparo: false };

    const baseJoystick = document.getElementById('baseJoystick');
    const palancaJoystick = document.getElementById('palancaJoystick');
    const botonSalto = document.getElementById('botonSalto');
    const botonDisparo = document.getElementById('botonDisparo');

    let idToqueJoystick = null;
    const radioMaximoJoystick = 40;

    function manejarInicioJoystick(e) {
      e.preventDefault();
      if (idToqueJoystick !== null) return;
      const toque = e.changedTouches[0];
      idToqueJoystick = toque.identifier;
      actualizarPosicionJoystick(toque.clientX, toque.clientY);
    }

    function manejarMovimientoJoystick(e) {
      if (idToqueJoystick === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const toque = e.changedTouches[i];
        if (toque.identifier === idToqueJoystick) {
          actualizarPosicionJoystick(toque.clientX, toque.clientY);
          break;
        }
      }
    }

    function manejarFinJoystick(e) {
      if (idToqueJoystick === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const toque = e.changedTouches[i];
        if (toque.identifier === idToqueJoystick) {
          idToqueJoystick = null;
          reiniciarJoystick();
          break;
        }
      }
    }

    function actualizarPosicionJoystick(clientX, clientY) {
      const rect = baseJoystick.getBoundingClientRect();
      const centroX = rect.left + rect.width / 2;
      const centroY = rect.top + rect.height / 2;

      let dx = clientX - centroX;
      let dy = clientY - centroY;
      let dist = Math.hypot(dx, dy);

      if (dist > radioMaximoJoystick) {
        dx = (dx / dist) * radioMaximoJoystick;
        dy = (dy / dist) * radioMaximoJoystick;
      }

      palancaJoystick.style.transform = `translate(${dx}px, ${dy}px)`;

      teclas.derecha = dx > 12;
      teclas.izquierda = dx < -12;
      teclas.arriba = dy < -15;
      teclas.abajo = dy > 15;
    }

    function reiniciarJoystick() {
      palancaJoystick.style.transform = `translate(0px, 0px)`;
      teclas.derecha = false;
      teclas.izquierda = false;
      teclas.arriba = false;
      teclas.abajo = false;
    }

    baseJoystick.addEventListener('touchstart', manejarInicioJoystick, { passive: false });
    window.addEventListener('touchmove', manejarMovimientoJoystick, { passive: false });
    window.addEventListener('touchend', manejarFinJoystick, { passive: false });
    window.addEventListener('touchcancel', manejarFinJoystick, { passive: false });

    botonSalto.addEventListener('touchstart', (e) => { e.preventDefault(); teclas.salto = true; }, { passive: false });
    botonSalto.addEventListener('touchend', (e) => { e.preventDefault(); teclas.salto = false; }, { passive: false });

    botonDisparo.addEventListener('touchstart', (e) => { e.preventDefault(); teclas.disparo = true; }, { passive: false });
    botonDisparo.addEventListener('touchend', (e) => { e.preventDefault(); teclas.disparo = false; }, { passive: false });

    let ratonPresionado = false;
    baseJoystick.addEventListener('mousedown', (e) => {
      ratonPresionado = true;
      actualizarPosicionJoystick(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => {
      if (ratonPresionado) actualizarPosicionJoystick(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => {
      if (ratonPresionado) {
        ratonPresionado = false;
        reiniciarJoystick();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') teclas.derecha = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') teclas.izquierda = true;
      if (e.key === 'ArrowUp' || e.key === 'w') teclas.arriba = true;
      if (e.key === 'ArrowDown' || e.key === 's') teclas.abajo = true;
      if (e.key === ' ' || e.key === 'k') teclas.salto = true;
      if (e.key === 'j' || e.key === 'z') teclas.disparo = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') teclas.derecha = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') teclas.izquierda = false;
      if (e.key === 'ArrowUp' || e.key === 'w') teclas.arriba = false;
      if (e.key === 'ArrowDown' || e.key === 's') teclas.abajo = false;
      if (e.key === ' ' || e.key === 'k') teclas.salto = false;
      if (e.key === 'j' || e.key === 'z') teclas.disparo = false;
    });

    class Particula {
      constructor(x, y, color, velX, velY, tamaño, vida) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velX = velX;
        this.velY = velY;
        this.tamaño = tamaño;
        this.vida = vida;
        this.vidaMaxima = vida;
      }

      actualizar() {
        this.x += this.velX;
        this.y += this.velY;
        this.vida--;
        this.tamaño *= 0.96;
      }

      dibujar(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.vida / this.vidaMaxima);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - camaraX, this.y, Math.max(1, this.tamaño), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class HeroeUnicornio {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.ancho = 60;
        this.alto = 70;
        this.mirandoDerecha = true;
        this.estaEnSuelo = false;
        this.salud = 100;
        this.saludMaxima = 100;
        this.enfriamientoDisparo = 0;
        this.tipoArma = 'NORMAL';
        this.temporizadorArma = 0;
        this.fotogramaAnim = 0;
      }

      actualizar() {
        const velocidad = 4.5;
        if (teclas.derecha) {
          this.velX = velocidad;
          this.mirandoDerecha = true;
        } else if (teclas.izquierda) {
          this.velX = -velocidad;
          this.mirandoDerecha = false;
        } else {
          this.velX = 0;
        }

        if (teclas.salto && this.estaEnSuelo) {
          this.velY = -12.5;
          this.estaEnSuelo = false;
          sonido.reproducirSalto();
        }

        this.velY += 0.55;
        this.x += this.velX;
        this.y += this.velY;

        if (this.y + this.alto / 2 >= SUELO_Y) {
          this.y = SUELO_Y - this.alto / 2;
          this.velY = 0;
          this.estaEnSuelo = true;
        }

        if (this.x - this.ancho / 2 < camaraX) {
          this.x = camaraX + this.ancho / 2;
        }

        if (this.enfriamientoDisparo > 0) this.enfriamientoDisparo--;
        if (this.temporizadorArma > 0) {
          this.temporizadorArma--;
          if (this.temporizadorArma <= 0) this.tipoArma = 'NORMAL';
        }

        if (teclas.disparo && this.enfriamientoDisparo === 0) {
          this.disparar();
        }

        this.fotogramaAnim += 0.15;
      }

      disparar() {
        sonido.reproducirDisparo();
        let cadencia = this.tipoArma === 'RAPIDO' ? 7 : 14;
        this.enfriamientoDisparo = cadencia;

        let xBoca = this.x + (this.mirandoDerecha ? 35 : -35);
        
        xBoca = xBoca + (teclas.arriba ? (this.mirandoDerecha ? -18:18):0)
        
        const yBoca = teclas.arriba ? this.y - 30 : this.y - 5;

        if (this.tipoArma === 'ABANICO') {
          [-0.2, 0, 0.2].forEach(offsetAngulo => {
            let anguloFinal = (this.mirandoDerecha ? 0 : Math.PI) + offsetAngulo;
            if (teclas.arriba) anguloFinal = -Math.PI/2 + offsetAngulo;
            proyectiles.push(new ProyectilArcoiris(xBoca, yBoca, anguloFinal, 11, true));
          });
        } else {
          let anguloFinal = this.mirandoDerecha ? 0 : Math.PI;
          if (teclas.arriba) anguloFinal = -Math.PI / 2;
          proyectiles.push(new ProyectilArcoiris(xBoca, yBoca, anguloFinal, 12, true));
        }

        for (let i = 0; i < 4; i++) {
          particulas.push(new Particula(xBoca, yBoca, '#fff', (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 4, 15));
        }
      }

      dibujar(ctx) {
        ctx.save();
        ctx.translate(this.x - camaraX, this.y);
        if (!this.mirandoDerecha) ctx.scale(-1, 1);

        const anguloPata = this.velX !== 0 ? Math.sin(this.fotogramaAnim) * 0.4 : 0;

        ctx.fillStyle = '#4a5d32';
        ctx.save();
        ctx.translate(10, 15);
        ctx.rotate(anguloPata);
        ctx.fillRect(-5, 0, 10, 20);
        ctx.restore();

        ctx.save();
        ctx.translate(-15, 15);
        ctx.rotate(-anguloPata);
        ctx.fillRect(-5, 0, 10, 20);
        ctx.restore();

        const gradCuerpo = ctx.createLinearGradient(-25, -20, 25, 20);
        gradCuerpo.addColorStop(0, '#ffffff');
        gradCuerpo.addColorStop(1, '#ffbbee');
        ctx.fillStyle = gradCuerpo;
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3b4e28';
        ctx.fillRect(-15, -18, 28, 22);
        ctx.fillStyle = '#5c723d';
        ctx.fillRect(-12, -15, 10, 8);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(16, -18, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffd1f0';
        ctx.beginPath();
        ctx.arc(26, -15, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(20, -20, 3.5, 0, Math.PI * 2);
        ctx.fill();

        const colores = ['#ff0055', '#ffaa00', '#00ffaa', '#0099ff', '#aa00ff'];
        colores.forEach((col, i) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(-2 - i * 5, -24 + Math.sin(this.fotogramaAnim + i) * 3, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        const gradCuerno = ctx.createLinearGradient(18, -28, 28, -42);
        gradCuerno.addColorStop(0, '#ffe600');
        gradCuerno.addColorStop(1, '#ff00aa');
        ctx.fillStyle = gradCuerno;
        ctx.beginPath();
        ctx.moveTo(18, -26);
        ctx.lineTo(32, -42);
        ctx.lineTo(24, -22);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#3b4e28';
        ctx.beginPath();
        ctx.arc(14, -24, 17, Math.PI * 1.1, Math.PI * 1.95);
        ctx.fill();

        ctx.save();
        let anguloArma = teclas.arriba ? -Math.PI / 2: 0;
        ctx.translate(15, -5);
        ctx.rotate(anguloArma);

        const gradArma = ctx.createLinearGradient(0, 0, 30, 0);
        gradArma.addColorStop(0, '#222');
        gradArma.addColorStop(0.5, '#555');
        gradArma.addColorStop(1, '#ff00aa');
        ctx.fillStyle = gradArma;
        ctx.fillRect(0, -6, 28, 12);

        ctx.fillStyle = '#00ffff';
        ctx.fillRect(24, -8, 6, 16);
        ctx.restore();

        ctx.restore();
      }
    }

    class ProyectilArcoiris {
      constructor(x, y, angulo, velocidad, esHeroe = true) {
        this.x = x;
        this.y = y;
        this.velX = Math.cos(angulo) * velocidad;
        this.velY = Math.sin(angulo) * velocidad;
        this.esHeroe = esHeroe;
        this.tamaño = esHeroe ? 8 : 6;
        this.marcadoParaEliminar = false;
        this.matiz = 0;
      }

      actualizar() {
        this.x += this.velX;
        this.y += this.velY;
        this.matiz = (this.matiz + 15) % 360;

        if (Math.random() < 0.6) {
          particulas.push(new Particula(
            this.x, this.y,
            this.esHeroe ? `hsl(${this.matiz}, 100%, 60%)` : '#ff0044',
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5,
            this.tamaño * 0.7,
            12
          ));
        }

        if (this.x < camaraX - 50 || this.x > camaraX + ANCHO_VISTA + 50 || this.y < 0 || this.y > ALTO_VISTA) {
          this.marcadoParaEliminar = true;
        }
      }

      dibujar(ctx) {
        ctx.save();
        ctx.translate(this.x - camaraX, this.y);

        if (this.esHeroe) {
          const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, this.tamaño);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, `hsl(${this.matiz}, 100%, 50%)`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, this.tamaño * 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#ff0044';
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, this.tamaño, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    class UnicornioOscuro {
      constructor(x, y, tipo = 'SOLDADO') {
        this.x = x;
        this.y = y;
        this.tipo = tipo;
        this.ancho = tipo === 'JEFE' ? 120 : 60;
        this.alto = tipo === 'JEFE' ? 130 : 70;
        this.salud = tipo === 'JEFE' ? 60 : (tipo === 'VOLADOR' ? 6 : 10);
        this.saludMaxima = this.salud;
        this.velX = tipo === 'VOLADOR' ? -2 : -1.2;
        this.velY = 0;
        this.temporizadorDisparo = Math.random() * 80;
        this.marcadoParaEliminar = false;
        this.fotogramaAnim = Math.random() * 10;
      }

      actualizar() {
        this.fotogramaAnim += 0.1;

        if (this.tipo === 'VOLADOR') {
          this.x += this.velX;
          this.y += Math.sin(this.fotogramaAnim * 0.5) * 1.5;
        } else if (this.tipo === 'SOLDADO') {
          this.x += this.velX;
          if (this.y + this.alto / 2 < SUELO_Y) {
            this.velY += 0.5;
            this.y += this.velY;
          } else {
            this.y = SUELO_Y - this.alto / 2;
          }
        } else if (this.tipo === 'JEFE') {
          if (this.x - heroe.x > 350) {
            this.x += this.velX;
          }
        }

        this.temporizadorDisparo++;
        const intervalo = this.tipo === 'JEFE' ? 45 : 120;
        if (this.temporizadorDisparo >= intervalo && Math.abs(this.x - heroe.x) < 700) {
          this.temporizadorDisparo = 0;
          this.disparar();
        }

        if (this.x < camaraX - 150) this.marcadoParaEliminar = true;
      }

      disparar() {
        const dx = heroe.x - this.x;
        const dy = heroe.y - this.y;
        const angulo = Math.atan2(dy, dx);

        if (this.tipo === 'JEFE') {
          proyectiles.push(new ProyectilArcoiris(this.x - 40, this.y - 10, angulo - 0.1, 7, false));
          proyectiles.push(new ProyectilArcoiris(this.x - 40, this.y - 10, angulo, 7, false));
          proyectiles.push(new ProyectilArcoiris(this.x - 40, this.y - 10, angulo + 0.1, 7, false));
        } else {
          proyectiles.push(new ProyectilArcoiris(this.x - 20, this.y, angulo, 6, false));
        }
      }

      dibujar(ctx) {
        ctx.save();
        ctx.translate(this.x - camaraX, this.y);
        if (this.tipo === 'JEFE') ctx.scale(1.8, 1.8);

        const gradCuerpo = ctx.createLinearGradient(-25, -20, 25, 20);
        gradCuerpo.addColorStop(0, '#1a0926');
        gradCuerpo.addColorStop(1, '#05010a');
        ctx.fillStyle = gradCuerpo;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (this.tipo === 'VOLADOR' || this.tipo === 'JEFE') {
          ctx.fillStyle = '#4a0028';
          ctx.beginPath();
          ctx.moveTo(-10, -10);
          ctx.lineTo(-30, -35 + Math.sin(this.fotogramaAnim) * 10);
          ctx.lineTo(-5, -15);
          ctx.fill();
        }

        ctx.fillStyle = '#150620';
        ctx.beginPath();
        ctx.arc(-14, -16, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff0033';
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(-18, -18, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#800020';
        ctx.beginPath();
        ctx.moveTo(-16, -24);
        ctx.lineTo(-28, -38);
        ctx.lineTo(-22, -22);
        ctx.fill();

        if (this.tipo === 'JEFE') {
          ctx.restore();
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(this.x - camaraX - 50, this.y - 80, 100, 10);
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(this.x - camaraX - 50, this.y - 80, (this.salud / this.saludMaxima) * 100, 10);
        }

        ctx.restore();
      }
    }

    class Potenciador {
      constructor(x, y, tipo) {
        this.x = x;
        this.y = y;
        this.tipo = tipo;
        this.tamaño = 20;
        this.marcadoParaEliminar = false;
        this.rebote = 0;
      }

      actualizar() {
        this.rebote += 0.08;
        if (this.y < SUELO_Y - 20) this.y += 2;
      }

      dibujar(ctx) {
        ctx.save();
        ctx.translate(this.x - camaraX, this.y + Math.sin(this.rebote) * 5);

        ctx.fillStyle = this.tipo === 'CURAR' ? '#00ffcc' : '#ff00aa';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let etiqueta = this.tipo === 'RAPIDO' ? 'R' : (this.tipo === 'ABANICO' ? 'S' : '❤️');
        ctx.fillText(etiqueta, 0, 1);

        ctx.restore();
      }
    }

    let heroe;
    let enemigos = [];
    let proyectiles = [];
    let particulas = [];
    let potenciadores = [];
    let temporizadorGeneracion = 0;

    function dibujarFondo(ctx) {
      const gradCielo = ctx.createLinearGradient(0, 0, 0, ALTO_VISTA);
      gradCielo.addColorStop(0, '#0a0017');
      gradCielo.addColorStop(0.6, '#280b3d');
      gradCielo.addColorStop(1, '#4a1240');
      ctx.fillStyle = gradCielo;
      ctx.fillRect(0, 0, ANCHO_VISTA, ALTO_VISTA);

      ctx.fillStyle = '#1c082b';
      for (let i = 0; i < 6; i++) {
        let x = (i * 220) - (camaraX * 0.2) % 220;
        ctx.beginPath();
        ctx.arc(x, 380, 120, 0, Math.PI, true);
        ctx.fill();
      }

      ctx.fillStyle = '#12041d';
      for (let i = 0; i < 4; i++) {
        let x = (i * 400) - (camaraX * 0.5) % 400;
        ctx.fillRect(x, 260, 60, 140);
        ctx.fillRect(x + 15, 220, 30, 40);
      }

      const gradSuelo = ctx.createLinearGradient(0, SUELO_Y, 0, ALTO_VISTA);
      gradSuelo.addColorStop(0, '#19062b');
      gradSuelo.addColorStop(1, '#05000a');
      ctx.fillStyle = gradSuelo;
      ctx.fillRect(0, SUELO_Y, ANCHO_VISTA, ALTO_VISTA - SUELO_Y);

      ctx.strokeStyle = '#ff00a0';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff00a0';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, SUELO_Y);
      ctx.lineTo(ANCHO_VISTA, SUELO_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function inicializarJuego() {
      heroe = new HeroeUnicornio(150, SUELO_Y - 40);
      enemigos = [];
      proyectiles = [];
      particulas = [];
      potenciadores = [];
      camaraX = 0;
      puntuacion = 0;
      temporizadorGeneracion = 0;
      estadoJuego = 'JUGANDO';

      enemigos.push(new UnicornioOscuro(700, SUELO_Y - 35, 'SOLDADO'));
      enemigos.push(new UnicornioOscuro(900, 200, 'VOLADOR'));

      document.getElementById('pantallaSuperpuesta').classList.add('oculto');
      actualizarHUD();
    }

    function actualizarHUD() {
      document.getElementById('barraSalud').style.width = `${Math.max(0, heroe.salud)}%`;
      document.getElementById('textoPuntuacion').innerText = puntuacion.toString().padStart(5, '0');
    }

    function activarGameOver() {
      estadoJuego = 'GAMEOVER';
      document.getElementById('tituloSuperpuesto').innerText = 'MISSION FAILED!';
      document.getElementById('subtituloSuperpuesto').innerText = `Final Score: ${puntuacion}`;
      document.getElementById('botonInicio').innerText = 'RETRY';
      document.getElementById('pantallaSuperpuesta').classList.remove('oculto');
    }

    function generarEnemigos() {
      temporizadorGeneracion++;
      if (temporizadorGeneracion % 130 === 0) {
        let xAparicion = camaraX + ANCHO_VISTA + 50;
        let aleatorio = Math.random();

        if (puntuacion > 1200 && aleatorio < 0.2 && !enemigos.some(e => e.tipo === 'JEFE')) {
          enemigos.push(new UnicornioOscuro(xAparicion, SUELO_Y - 65, 'JEFE'));
        } else if (aleatorio < 0.6) {
          enemigos.push(new UnicornioOscuro(xAparicion, SUELO_Y - 35, 'SOLDADO'));
        } else {
          enemigos.push(new UnicornioOscuro(xAparicion, 150 + Math.random() * 150, 'VOLADOR'));
        }
      }
    }

    function verificarColisiones() {
      potenciadores.forEach(p => {
        if (!p.marcadoParaEliminar && Math.hypot(heroe.x - p.x, heroe.y - p.y) < 40) {
          p.marcadoParaEliminar = true;
          sonido.reproducirPotenciador();
          if (p.tipo === 'CURAR') {
            heroe.salud = Math.min(100, heroe.salud + 30);
          } else {
            heroe.tipoArma = p.tipo;
            heroe.temporizadorArma = 400;
          }
          actualizarHUD();
        }
      });

      proyectiles.forEach(proy => {
        if (proy.marcadoParaEliminar) return;

        if (proy.esHeroe) {
          enemigos.forEach(enemigo => {
            if (!enemigo.marcadoParaEliminar && Math.hypot(proy.x - enemigo.x, proy.y - enemigo.y) < enemigo.ancho / 2) {
              proy.marcadoParaEliminar = true;
              enemigo.salud -= 3;

              for (let i = 0; i < 3; i++) {
                particulas.push(new Particula(proy.x, proy.y, '#ff00a0', (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, 5, 15));
              }

              if (enemigo.salud <= 0) {
                enemigo.marcadoParaEliminar = true;
                sonido.reproducirExplosion();
                puntuacion += enemigo.tipo === 'JEFE' ? 500 : 100;
                actualizarHUD();

                for (let i = 0; i < 15; i++) {
                  particulas.push(new Particula(enemigo.x, enemigo.y, '#ff0055', (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 8, 25));
                }

                if (Math.random() < 0.3) {
                  let tipos = ['RAPIDO', 'ABANICO', 'CURAR'];
                  let elegido = tipos[Math.floor(Math.random() * tipos.length)];
                  potenciadores.push(new Potenciador(enemigo.x, enemigo.y, elegido));
                }
              }
            }
          });
        } else {
          if (Math.hypot(proy.x - heroe.x, proy.y - heroe.y) < heroe.ancho / 2.5) {
            proy.marcadoParaEliminar = true;
            heroe.salud -= 10;
            actualizarHUD();

            for (let i = 0; i < 6; i++) {
              particulas.push(new Particula(heroe.x, heroe.y, '#ff0000', (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 6, 20));
            }

            if (heroe.salud <= 0) {
              activarGameOver();
            }
          }
        }
      });

      enemigos.forEach(enemigo => {
        if (!enemigo.marcadoParaEliminar && Math.hypot(heroe.x - enemigo.x, heroe.y - enemigo.y) < 40) {
          heroe.salud -= 0.5;
          actualizarHUD();
          if (heroe.salud <= 0) activarGameOver();
        }
      });
    }

    function bucleJuego() {
      ctx.clearRect(0, 0, ANCHO_VISTA, ALTO_VISTA);

      if (estadoJuego === 'JUGANDO') {
        if (heroe.x - camaraX > ANCHO_VISTA * 0.45) {
          camaraX += (heroe.x - camaraX - ANCHO_VISTA * 0.45) * 0.1;
        }

        heroe.actualizar();
        generarEnemigos();

        enemigos.forEach(e => e.actualizar());
        proyectiles.forEach(p => p.actualizar());
        particulas.forEach(pt => pt.actualizar());
        potenciadores.forEach(pw => pw.actualizar());

        verificarColisiones();

        enemigos = enemigos.filter(e => !e.marcadoParaEliminar);
        proyectiles = proyectiles.filter(p => !p.marcadoParaEliminar);
        particulas = particulas.filter(pt => pt.vida > 0);
        potenciadores = potenciadores.filter(pw => !pw.marcadoParaEliminar);
      }

      dibujarFondo(ctx);

      potenciadores.forEach(pw => pw.dibujar(ctx));
      enemigos.forEach(e => e.dibujar(ctx));
      if (heroe) heroe.dibujar(ctx);
      proyectiles.forEach(p => p.dibujar(ctx));
      particulas.forEach(pt => pt.dibujar(ctx));

      requestAnimationFrame(bucleJuego);
    }

    document.getElementById('botonInicio').addEventListener('click', () => {
      sonido.inicializar();
      inicializarJuego();
    });

    requestAnimationFrame(bucleJuego);

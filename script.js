let grid_template_area = [['intro', 'main', 'main', 'main'],['intro', 'facts', 'something', 'socials']]
let grid_template_cols = ['1.25fr', '1fr', '1fr', '1fr'];
let grid_template_rows = ['1.5fr', '1fr'];

function updateGridAreas() {
    const grid = document.getElementById('cellgrid');
    const panels = document.querySelectorAll('.panel');
    const oldPositions = new Map();
    panels.forEach(panel => {
        const rect = panel.getBoundingClientRect();
        oldPositions.set(panel, { left: rect.left, top: rect.top });
    });

    //
    const activeCells = Array.from(document.querySelectorAll('.cell')).map(cell => cell.id.replace('cell', ''));

    if(activeCells.length==0){
        const audio = new Audio('Audio/Shut Down.mp3');
        audio.addEventListener('ended', () => {
            window.location.href = 'about:blank';
        });
        setTimeout(() => {
            audio.play();
        }, 1000);
    }
    
    if ((!activeCells.includes('facts')) && (!activeCells.includes('socials')) & (!activeCells.includes('something'))){
        let rowIndex = -1;
        for (let row of grid_template_area){
            const indie = row.findIndex(item => ['facts','socials','something'].includes(item));;
            if (indie!=-1){
                rowIndex=grid_template_area.indexOf(row); break;
            }
        }
        if (rowIndex!=-1){
            grid_template_area = grid_template_area.filter((_, i)=>i!==rowIndex);
            grid_template_rows = grid_template_rows.filter((_, i)=>i!==rowIndex);
        }
    }

    for (let item of ["intro","facts","something", "socials"]){
        if (!activeCells.includes(item)){
            let colIndex = -1;
            for (let row of grid_template_area){
                const indie = row.indexOf(item);
                if (indie!=-1){
                    colIndex=indie; break;
                }
            }
            if (colIndex!=-1){
                grid_template_area = grid_template_area.map(inner => inner.filter((_, i)=>i!==colIndex));
                grid_template_cols = grid_template_cols.filter((_, i)=>i!==colIndex);
            }
        }
    }

    if (!activeCells.includes('main')){
        let rowIndex = -1;
        for (let row of grid_template_area){
            const indie = row.indexOf('main');
            if (indie!=-1){
                rowIndex=grid_template_area.indexOf(row); break;
            }
        }
        if (rowIndex!=-1){
            grid_template_area = grid_template_area.filter((_, i)=>i!==rowIndex);
            grid_template_rows = grid_template_rows.filter((_, i)=>i!==rowIndex);
        }
    }

    if(activeCells.includes('intro') && grid_template_cols.length>1){
        let n = grid_template_cols.length - 1;
        grid_template_cols=['1.25fr'];
        for (let i =0; i<n; i++){
            grid_template_cols.push(String(3.0/n)+'fr');
        }
    }

    if(activeCells.includes('intro') && activeCells.length==1){
        grid_template_area = [['intro']];
        grid_template_cols = ['1fr'];
        grid_template_rows = ['1fr'];
    }

    let newAreas = grid_template_area.map(row => `"${row.join(' ')}"`).join(' ');
    grid.style.gridTemplateAreas = newAreas;
    grid.style.gridTemplateColumns = grid_template_cols.join(' ');
    grid.style.gridTemplateRows = grid_template_rows.join(' ');

    console.log("BREAK")
    console.log(grid_template_area);
    console.log(grid_template_rows);
    console.log(grid_template_cols);
    //


    requestAnimationFrame(() => {
        panels.forEach(panel => {
            const old = oldPositions.get(panel);
            const newRect = panel.getBoundingClientRect();
            const dx = old.left - newRect.left;
            const dy = old.top - newRect.top;
            panel.style.transition = 'none';
            panel.style.transform = `translate(${dx}px, ${dy}px)`;
            panel.offsetHeight;
            animateSnap(panel, dx, dy);
        });
    });
}

function animateSnap(el, dx, dy) {
    let start = null;
    const damping = 5;
    const omega = 15;
    const initialDisplacement = Math.sqrt(dx*dx + dy*dy);
    const theta = Math.atan2(dy, dx);

    function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = (timestamp - start) / 1000;

        const amplitude = initialDisplacement * Math.exp(-damping * elapsed);
        const displacement = amplitude * Math.cos(omega * elapsed);

        const x = displacement * Math.cos(theta);
        const y = displacement * Math.sin(theta);
        el.style.transform = `translate(${x}px, ${y}px)`;

        if (amplitude > 0.5) {
            requestAnimationFrame(step);
        } else {
            el.style.transform = 'translate(0px, 0px)';
        }
    }

    requestAnimationFrame(step);
}


//==========================
//MAIN

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
          window.location.reload();
        }
      });      



    const h1 = document.getElementById('hoverText');
    h1.style.whiteSpace = 'pre';
    const characters = h1.textContent.split('');
    h1.textContent = '';

    characters.forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;

    // Add hover effect
    span.style.display = 'inline-block';
    span.style.transition = 'transform 0.1s ease';

    span.addEventListener('mouseenter', () => {
        span.style.transform = 'translateY(-5px)';
    });

    span.addEventListener('mouseleave', () => {
        span.style.transform = 'translateY(0)';
    });

    h1.appendChild(span);
    });

    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            setTimeout(()=>{
                const cell = button.closest('.cell');
                cell.remove();
                updateGridAreas();
            }, 75);
        });
      });
      let isDragging = false;
      let Dragging = null;
      let offsetX = 0;
      let offsetY = 0;
  
      // Store the original position
      let originalRect = null;
      let startLeft = 0;
      let startTop = 0;
  
      // Track last transform
      let deltaX = 0;
      let deltaY = 0;
  
      const isWobbling =new WeakMap();
      let highest = 0;
  
      const elements = document.getElementsByClassName("draggable");
      for (let i=0; i<elements.length; i++){
          elements[i].style.cursor = "grab";
          const el = elements[i];
          el.addEventListener("mousedown", (e) => {
            isDragging = true;
            originalRect = el.getBoundingClientRect();
            startLeft = originalRect.left;
            startTop = originalRect.top;
            Dragging = el;
            const currentZ = parseInt(getComputedStyle(Dragging).zIndex, 10);
            highest+=1;
            Dragging.style.zIndex = highest;
            offsetX = e.clientX - originalRect.left;
            offsetY = e.clientY - originalRect.top;
            Dragging.style.transition = "none";
            Dragging.style.cursor = "grabbing";
          });
      }
  
      document.addEventListener("mousemove", (e) => {
          if (!isDragging) return;
  
          deltaX = e.clientX - startLeft - offsetX;
          deltaY = e.clientY - startTop - offsetY;
  
          Dragging.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });
  
      document.addEventListener("mouseup", () => {
            if (!isDragging) return;
            Dragging.style.cursor = "grab";
            let curobject = Dragging;
            isWobbling.set(curobject, true);
            let deltatime=0; let curamplitude=50; let curdis=50;
            let inix = curobject.getBoundingClientRect().left-startLeft
            let iniy = curobject.getBoundingClientRect().top-startTop
            let initialdisplacement = Math.sqrt(Math.abs(inix)**2 + Math.abs(iniy)**2);
            let theta = Math.atan2(iniy,inix);
            let start = Date.now();
            let damping = 10; let omega=15;
            isDragging = false;
            Dragging = null;
            //curobject.style.zIndex = '';
            const snapback = setInterval(() => {
              deltatime = Date.now() - start;
              curamplitude = initialdisplacement * (Math.E **(-damping * deltatime/1000));
              curdis = curamplitude*Math.cos(omega*(deltatime/1000))
              curobject.style.transform="translate(" + String(curdis*Math.cos(theta)) + "px, " + String(curdis*Math.sin(theta)) + "px)";
              if(curamplitude<0.1 || Dragging==curobject){
                  isWobbling.set(curobject, false);
                  curobject.style.transform="translate(0px,0px)";
                  clearInterval(snapback);
              }
          }, 10);
  
      });

    const links = document.querySelectorAll(".draggable a");

    links.forEach(link => {
        link.addEventListener("mousedown", (e) => {
            e.stopPropagation(); // Prevent drag from initiating
        });

        link.addEventListener("click", (e) => {
            if (isDragging) {
                e.preventDefault(); // Prevent accidental navigation during drag
            }
        });
    });

    const clickSound = new Audio('Audio/Mouse Click.mp3');

    document.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play();
    });

    //==========================
    //FACTS CAROUSEL

    const facts = [
        "Children are the future - unless we stop them. And we're running out of time.",
        "Every positive even integer greater than 2 can be written as the sum of two primes. <br style='margin-bottom:10px'> I have discovered a remarkable proof of this that these margins are too narrow to contain.",
        "You should give me money.",
        "Yo mama so fat that she sought medical assistance, and through strenuous exercise and dieting has brought her health back under control. <br style='margin-bottom:10px'> We are very proud of her.",
        "A group of flamingos is called a 'flamboyance'."
    ];

    let currentIndex = 0;
    let isAnimatingFacts = false;

    const container = document.getElementById("fact-container");
    const currentDiv = document.getElementById("currentfact");
    const nextDiv = document.getElementById("nextfact");

    currentDiv.textContent = facts[currentIndex];

    function showFact(direction) {
        if(isAnimatingFacts) return;
        isAnimatingFacts=true;
        const increment = direction === "right" ? 1 : -1;
        const nextIndex = (currentIndex + increment + facts.length) % facts.length;

        nextDiv.innerHTML = facts[nextIndex];

        nextDiv.style.transition = "none";
        currentDiv.style.transition = "none";
        nextDiv.style.transform = `translateX(${direction === "right" ? '100%' : '-100%'})`;

        void nextDiv.offsetWidth;

        nextDiv.style.transition = "transform 0.5s ease";
        currentDiv.style.transition = "transform 0.5s ease";
        currentDiv.style.transform = `translateX(${direction === "right" ? '-100%' : '100%'})`;
        nextDiv.style.transform = "translateX(0%)";

        setTimeout(() => {
            currentDiv.innerHTML = nextDiv.innerHTML;
            nextDiv.innerHTML="";
            currentDiv.style.transition = "none";
            currentDiv.style.transform = "translateX(0%)";
            nextDiv.style.transition = "none";
            nextDiv.style.transform = "translateX(0%)";
            isAnimatingFacts=false;
            currentIndex = nextIndex;
        }, 500);
    }
    document.getElementById("factsrightbutton").addEventListener("click", () => showFact("right"));
    document.getElementById("factsleftbutton").addEventListener("click", () => showFact("left"));
    
    //============================================
    //LIGHT-DARK TOGGLE

    const switchEl = document.getElementById('lightdarkswitch');
    switchEl.addEventListener('click', () => {
      document.querySelectorAll('.toggleable').forEach(el => el.classList.toggle('on'));
    });

    //==============================================

});


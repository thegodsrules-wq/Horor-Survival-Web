// Scene & Camera
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 50);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0,2,5);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(5,10,5);
scene.add(light);

// Floor
const floorGeo = new THREE.PlaneGeometry(50,50);
const floorMat = new THREE.MeshStandardMaterial({color:0x222222});
const floor = new THREE.Mesh(floorGeo,floorMat);
floor.rotation.x = -Math.PI/2;
scene.add(floor);

// Player
const playerGeo = new THREE.BoxGeometry(0.5,1,0.5);
const playerMat = new THREE.MeshStandardMaterial({color:0x00ff00});
const player = new THREE.Mesh(playerGeo,playerMat);
player.position.set(0,0.5,0);
scene.add(player);

// Monster
const monsterGeo = new THREE.BoxGeometry(0.5,1,0.5);
const monsterMat = new THREE.MeshStandardMaterial({color:0xff0000});
const monster = new THREE.Mesh(monsterGeo,monsterMat);
monster.position.set(5,0.5,5);
scene.add(monster);

// Health & story
let health = 100;
const healthText = document.getElementById('health');
const storyText = document.getElementById('story');

// Controls
let keys = {};
document.addEventListener('keydown', e=>keys[e.key.toLowerCase()]=true);
document.addEventListener('keyup', e=>keys[e.key.toLowerCase()]=false);

// Touch joystick
const joyBg = document.getElementById('joystickBg');
const joyHandle = document.getElementById('joystickHandle');
let touchId = null;
let joyInput = {x:0, y:0};

joyBg.addEventListener('touchstart', e=>{
    touchId = e.changedTouches[0].identifier;
});
joyBg.addEventListener('touchmove', e=>{
    for(let t of e.changedTouches){
        if(t.identifier===touchId){
            const rect = joyBg.getBoundingClientRect();
            let dx = t.clientX - (rect.left + rect.width/2);
            let dy = t.clientY - (rect.top + rect.height/2);
            let dist = Math.min(Math.sqrt(dx*dx+dy*dy), rect.width/2);
            let angle = Math.atan2(dy,dx);
            joyHandle.style.left = rect.width/2 + dist*Math.cos(angle)-joyHandle.offsetWidth/2 + "px";
            joyHandle.style.top = rect.height/2 + dist*Math.sin(angle)-joyHandle.offsetHeight/2 + "px";
            joyInput.x = (dist*Math.cos(angle))/(rect.width/2);
            joyInput.y = -(dist*Math.sin(angle))/(rect.height/2);
        }
    }
});
joyBg.addEventListener('touchend', e=>{
    for(let t of e.changedTouches){
        if(t.identifier===touchId){
            joyHandle.style.left = "25px";
            joyHandle.style.top = "25px";
            joyInput = {x:0,y:0};
            touchId = null;
        }
    }
});

// Animation loop
function animate(){
    requestAnimationFrame(animate);

    // Player move
    const speed = 0.05;
    player.position.x += keys['a']?-speed:0;
    player.position.x += keys['d']?speed:0;
    player.position.z += keys['w']?-speed:0;
    player.position.z += keys['s']?speed:0;
    player.position.x += joyInput.x*speed;
    player.position.z += joyInput.y*speed;

    // Monster chase
    const dir = new THREE.Vector3();
    dir.subVectors(player.position, monster.position).normalize();
    monster.position.add(dir.multiplyScalar(0.02));

    // Collision
    if(player.position.distanceTo(monster.position)<0.6){
        health -=1;
        healthText.innerText = health;
        if(health<=0) storyText.innerText="Game Over!";
    }

    renderer.render(scene,camera);
}
animate();
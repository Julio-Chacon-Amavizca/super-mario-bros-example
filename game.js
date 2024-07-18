/* Phaser Global */

import { createAnimations } from "./animations.js";

const config = {
    type: Phaser.AUTO, // Phaser will decide how to render our game (WebGL or Canvas)
    width: 256, // game width
    height: 244, // game height
    backgroundColor: '#049cd8', // background color black
    parent: 'game', // our game div id
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload, // Se ejecuta para cargar los recursos
        create, // Se ejecuta cuando el juego comienza
        update // Se ejecuta en cada frame
    }
};

new Phaser.Game(config); // Se crea el juego

function preload() {
    // this -> game -> el juego que estamos cosntruyendo
    this.load.image(
        'cloud1', // <-- id
        'assets/scenery/overworld/cloud1.png');

    this.load.image(
        'floorbricks', // <-- id
        'assets/scenery/overworld/floorbricks.png');

    this.load.spritesheet('mario', 'assets/entities/mario.png',
        { frameWidth: 18, frameHeight: 16 }
    );

    this.load.audio('gameover', 'assets/sound/music/gameover.mp3');
} // 1.

function create() {
    // image(x, y, key)
    this.add.image(100, 50, 'cloud1')
        .setOrigin(0, 0)
        .setScale(0.15);

    this.floor = this.physics.add.staticGroup();

    this.floor.create(0, config.height - 16, 'floorbricks')
        .setOrigin(0, 0.5)
        .refreshBody();


    this.floor.create(170, config.height - 16, 'floorbricks')
        .setOrigin(0, 0.5)
        .refreshBody();


    // sprite(x, y, key)
    //this.mario = this.add.sprite(50, 210, 'mario')
    //  .setOrigin(0, 1)

    this.mario = this.physics.add.sprite(50, 100, 'mario')
        .setOrigin(0, 1)
        .setCollideWorldBounds(true)
        .setGravityY(300);

    this.physics.world.setBounds(0, 0, 2000, config.height);
    this.physics.add.collider(this.mario, this.floor);

    this.cameras.main.setBounds(0, 0, 2000, config.height);
    this.cameras.main.startFollow(this.mario);

    // createAnimations(this) // <-- Se llama a la función
    createAnimations(this);

    this.keys = this.input.keyboard.createCursorKeys();
} // 2.

function update() {
    // Se actualiza el juego
    if (this.mario.isDead) {
        return;
    }
    if (this.keys.left.isDown) {
        this.mario.anims.play('mario-walk', true);
        this.mario.x -= 2;

    } else if (this.keys.right.isDown) {
        this.mario.anims.play('mario-walk', true);
        this.mario.x += 2;
    } else {
        this.mario.anims.play('mario-idle', true);
    }

    if (this.keys.up.isDown && this.mario.body.touching.down) {
        this.mario.anims.play('mario-jump', true);
        this.mario.setVelocityY(-200);

    }

    if (this.mario.y >= config.height) {
        this.mario.isDead = true;
        this.mario.anims.play('mario-die', true);

        this.mario.setCollideWorldBounds(false);
        this.sound.add('gameover', { volume: 0.2 }).play();

        setTimeout(() => {
            this.mario.setVelocityY(-350);
        }, 100);

        setTimeout(() => {
            this.scene.restart();
        }, 6000);
    }

} // 3. Continuamente se ejecuta
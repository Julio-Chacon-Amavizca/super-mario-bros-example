/* Phaser Global */
// Se crea el juego
import { createAnimations } from './animations.js'
import { initAudio, playAudio } from './audio.js'
import { checkControls } from './control.js'
import { initSpritesheet } from './spritesheet.js'

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
      debug: true
    }
  },
  scene: {
    preload, // Se ejecuta para cargar los recursos
    create, // Se ejecuta cuando el juego comienza
    update // Se ejecuta en cada frame
  }
}

new Phaser.Game(config) // Se crea el juegoSe crea el juego

function preload () {
  // this -> game -> el juego que estamos cosntruyendo
  this.load.image(
    'cloud1', // <-- id
    'assets/scenery/overworld/cloud1.png')

  this.load.image(
    'floorbricks', // <-- id
    'assets/scenery/overworld/floorbricks.png')

  this.load.image(
    'supermushroom', // <-- id
    'assets/collectibles/super-mushroom.png')

  // -- spritesheets --

  initSpritesheet(this) // <-- Se llama a la función

  // -- audio --

  initAudio(this) // <-- Se llama a la función
} // 1.

function create () {
  createAnimations(this)
  // image(x, y, key)
  this.add.image(100, 50, 'cloud1')
    .setOrigin(0, 0)
    .setScale(0.15)

  this.floor = this.physics.add.staticGroup()

  this.floor.create(0, config.height - 16, 'floorbricks')
    .setOrigin(0, 0.5)
    .refreshBody()

  this.floor.create(170, config.height - 16, 'floorbricks')
    .setOrigin(0, 0.5)
    .refreshBody()

  // sprite(x, y, key)
  // this.mario = this.add.sprite(50, 210, 'mario')
  //  .setOrigin(0, 1)

  this.mario = this.physics.add.sprite(50, 100, 'mario')
    .setOrigin(0, 1)
    .setCollideWorldBounds(true)
    .setGravityY(200)

  this.goomba = this.physics.add.sprite(120, config.height - 48, 'goomba')
    .setOrigin(0, 1)
    .setCollideWorldBounds(true)
    .setGravityY(200)
    .setVelocityX(-100)
  this.goomba.anims.play('goomba-walk', true)

  this.collectibles = this.physics.add.staticGroup()
  this.collectibles.create(200, config.height - 80, 'coin').anims.play('coin-spin', true)
  this.collectibles.create(250, config.height - 80, 'coin').anims.play('coin-spin', true)
  this.collectibles.create(120, config.height - 40, 'supermushroom').anims.play('supermushroom-idle', true)
  this.physics.add.overlap(this.mario, this.collectibles, collectItem, null, this)

  this.physics.world.setBounds(0, 0, 2000, config.height)
  this.physics.add.collider(this.mario, this.floor)
  this.physics.add.collider(this.goomba, this.floor)
  this.physics.add.collider(this.goomba, this.mario,
    onHitEnemy, null, this)

  this.cameras.main.setBounds(0, 0, 2000, config.height)
  this.cameras.main.startFollow(this.mario)

  // createAnimations(this) // <-- Se llama a la función

  this.keys = this.input.keyboard.createCursorKeys()
} // 2.

function onHitEnemy (goomba, mario) {
  if (mario.body.touching.down && goomba.body.touching.up) {
    goomba.anims.play('goomba-die', true)
    goomba.setVelocityX(0)
    mario.setVelocityY(-200)
    playAudio('goomba-stomp', this)
    addToScore(200, goomba, this)

    setTimeout(() => {
      goomba.destroy()
    }, 500)
  } else {
    // Muere mario
    killMario(this)
  }
}
function update () {
  const { mario } = this

  checkControls(this)

  // Si mario se cae
  if (mario.y >= config.height) {
    killMario(this)
  }
} // 3. Continuamente se ejecuta

function collectItem (mario, item) {
  const { texture: { key } } = item
  item.destroy()
  if (key === 'coin') {
    playAudio('coin-collect', this, { volume: 0.1 })

    addToScore(100, item, this)
  } else if (key) {
    this.physics.world.pause()
    this.anims.pauseAll()

    playAudio('mushroom-grow', this, { volume: 0.1 })

    let i = 0
    const interval = setInterval(() => {
      i++
      mario.anims.play(i % 2 === 0
        ? 'mario-grown-idle'
        : 'mario-idle', true
      )
    }
    , 100)

    mario.isGrown = true
    mario.isBlocked = true

    setTimeout(() => {
      mario.setDisplaySize(18, 32)
      mario.body.setSize(18, 32)
      mario.isBlocked = false

      clearInterval(interval)
      this.physics.world.resume()
      this.anims.resumeAll()
      mario.isBlocked = false
    }, 800)
  }

  /*
  this.tweens.add({
    targets: scoreText,
    y: scoreText.y - 20,
    alpha: 0,
    duration: 500,
    onComplete: () => {
      scoreText.destroy()
    }
  }) */
}
function addToScore (scoreToAdd, origin, game) {
  const scoreText = game.add.text(origin.x, origin.y, scoreToAdd, { fontFamily: 'pixel', fontSize: config.width / 40 })

  game.tweens.add({
    targets: scoreText,
    y: scoreText.y - 20,
    duration: 500,
    onComplete: () => {
      game.tweens.add({
        targets: scoreText,
        alpha: 0,
        duration: 100,
        onComplete: () => {
          scoreText.destroy()
        }
      })
    }
  })
}

function killMario (game) {
  const { mario, scene } = game

  if (mario.isDead) return

  mario.isDead = true
  mario.anims.play('mario-die', true)

  mario.setCollideWorldBounds(false)

  playAudio('gameover', game, { volume: 0.1 })

  mario.body.checkCollision.none = true
  mario.setVelocityX(0)

  setTimeout(() => {
    mario.setVelocityY(-250)
  }, 100)

  setTimeout(() => {
    scene.restart()
    mario.destroy()
  }, 2000)
}
// 4. Se ejecuta en cada frame

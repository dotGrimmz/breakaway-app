export const gameProps = {
    ballObj: {
        x: 20,
        y: 200,
        dx: 5,
        dy: 5,
        rad: 10,
        speed: 10,
      },
      brickObj: {
        x: 0.5,
        y: 50,
        height: 20,
        width: 0,
        density: 2,
        colors: ["red", "lightblue"],
      },
      player: {
        name: "Grimmz",
        lives: 5,
        score: 0,
        level: 1,
      },
      paddleProps: {
        height: 20,
        width: 100,
        x: 100,
        y: 0,
        color: "orange",
      },
      
}

export type PaddleProps = typeof gameProps.paddleProps

export type Player = typeof gameProps.player

export type BallObj = typeof gameProps.ballObj

export type BrickObj = typeof gameProps.brickObj

const axisOpts =["X", "Y"]
type AxisOpts = typeof axisOpts[number]
export type BrickCollision = {
    hit: boolean;
    axis?: AxisOpts
}
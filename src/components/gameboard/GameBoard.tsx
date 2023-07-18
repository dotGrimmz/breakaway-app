import React, { SetStateAction, Dispatch } from "react";
import { useRef, useEffect, FC, useState } from "react";
import { BallObj, BrickCollision, BrickObj, PaddleProps, Player, gameProps } from "~/gameProps";

type Brick = {
  draw: (ctx: CanvasRenderingContext2D) => void;
  x: number;
  w: number;
  h: number;
  y: number;
  broke?: boolean;
  canvasColor?: string;
};

// level: number;
//     bricks: number[] | undefined;
//     canvasEle: HTMLCanvasElement;
//     brick_Obj: typeof brickObj;
const getPlayerStats = ({
  ctx,
  player,
  canvas,
}: {
  ctx: CanvasRenderingContext2D;
  player: {
    name?: string;
    score?: number;
    lives?: number;
  };
  canvas: HTMLCanvasElement;
}) => {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(`Name: ${player.name}`, 20, 30);

  ctx.font = "20px Arial";
  ctx.fillStyle = "red";
  let gap = 0;
  if (player.lives) {
    for (let i = 0; i < player.lives; i++) {
      ctx.fillText("❤️", canvas.width / 2 + gap, 30);
      gap += 30;
    }
  }

  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(`Score: ${player.score}`, canvas.width - 140, 30);
};

const handleBallMovement = ({ ctx, ballObj }: { ctx: CanvasRenderingContext2D; ballObj: BallObj }) => {
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(ballObj.x, ballObj.y, ballObj.rad, 0, 2 * Math.PI);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ballObj.x += ballObj.dx;
  ballObj.y += ballObj.dy;
};

const handleWallCollision = ({
  ballObj,
  player,
  canvas,
  paddleProps,
}: {
  ballObj: BallObj;
  player: Player;
  canvas: HTMLCanvasElement;
  paddleProps: PaddleProps;
}) => {
  if (ballObj.y + ballObj.rad > canvas.height) {
    player.lives--;
    ballObj.x = paddleProps.x;
    ballObj.y = paddleProps.y - 30;
    ballObj.dx = 6 * (Math.random() * 2 - 1);
    ballObj.dy = -6;
  }
  if (ballObj.y - ballObj.rad < 0) {
    ballObj.dy *= -1;
  }

  if (ballObj.x + ballObj.rad > canvas.width || ballObj.x - ballObj.rad < 0) {
    ballObj.dx *= -1;
  }
};

const handleBrickCollision = ({ ballObj, brickObj }: { ballObj: BallObj; brickObj: BrickObj }): BrickCollision => {
  const distX = Math.abs(ballObj.x - brickObj.x - brickObj.width / 2);
  const distY = Math.abs(ballObj.y - brickObj.y - brickObj.height / 2);

  if (distX > brickObj.width / 2 + ballObj.rad) {
    return {
      hit: false,
    };
  }
  if (distY > brickObj.height / 2 + ballObj.rad) {
    return {
      hit: false,
    };
  }

  if (distX <= brickObj.width / 2) {
    return {
      hit: true,
      axis: "Y",
    };
  }
  if (distY <= brickObj.height / 2) {
    return {
      hit: true,
      axis: "X",
    };
  }

  // also test for corner collisions
  var dx = distX - brickObj.width / 2;
  var dy = distY - brickObj.height / 2;
  return {
    hit: dx * dx + dy * dy <= ballObj.rad * ballObj.rad,
    axis: "X",
  };
};

const handlePaddle = ({
  ctx,
  canvas,
  paddleProps,
}: {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  paddleProps: PaddleProps;
}) => {
  const move = () => {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = "FFA62B";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.fillStyle = "FFA62B";
    ctx.shadowBlur = 0;
    ctx.shadowColor = "blue";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fill();
  };

  // ctx.fillStyle = paddle.broke ? "white" : paddle.colors[1];
  // ctx.strokeStyle = paddle.broke ? "white" : "red";
  // ctx.lineWidth = 1;
  // ctx.fillStyle = paddle.broke ? "white" : paddle.colors[1];

  const generateUpdatePaddle = () => {
    return {
      x: paddleProps.x,
      y: canvas.height - 30,
      height: 20,
      width: paddleProps.width,
      move,
      colors: ["red", "#FFA62B"],
    };
  };

  let paddle = generateUpdatePaddle();
  paddle.move();
  if (paddleProps.x <= 0) {
    paddleProps.x = 0;
  } else if (paddleProps.x + paddleProps.width >= canvas.width) {
    paddleProps.x = canvas.width - paddleProps.width;
  }
};

const handlePaddleHit = ({ ballObj, paddleProps }: { ballObj: BallObj; paddleProps: PaddleProps }) => {
  if (
    ballObj.x < paddleProps.x + paddleProps.width &&
    ballObj.x > paddleProps.x &&
    paddleProps.y < paddleProps.y + paddleProps.height &&
    ballObj.y + ballObj.rad > paddleProps.y - paddleProps.height / 2
  ) {
    // CHECK WHERE THE ballObj HIT THE paddleProps
    let collidePoint = ballObj.x - (paddleProps.x + paddleProps.width / 2);

    // NORMALIZE THE VALUES
    collidePoint = collidePoint / (paddleProps.width / 2);

    // CALCULATE THE ANGLE OF THE ballObj
    let angle = (collidePoint * Math.PI) / 3;

    ballObj.dx = ballObj.speed * Math.sin(angle);
    ballObj.dy = -ballObj.speed * Math.cos(angle);
  }
};
export const GameBoard: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { ballObj, paddleProps, brickObj, player } = gameProps;

  const assignBrickSet = ({
    level,
    bricks,
    canvasEle,
    brick_Obj,
  }: {
    level: number;
    bricks: number[] | undefined;
    canvasEle: HTMLCanvasElement;
    brick_Obj: typeof brickObj;
  }): Brick[] | undefined => {
    brick_Obj.width = canvasEle.width / 5 - 1;
    let newBricks = [];
    const levelsFilled = bricks && bricks.length >= 5 * level;
    if (!bricks) return [];
    if (levelsFilled) return;

    for (let i = 0; i < 5 * level; i++) {
      const { x, y, width, height, colors } = brick_Obj;
      const newBrick = singleBrick({
        x: x,
        y: y,
        w: width,
        h: height,
        colors: colors,
      });
      newBricks.push(newBrick);
      brick_Obj.x += brick_Obj.width + 1;
      if (brick_Obj.x + brick_Obj.width >= canvasEle.width) {
        brick_Obj.x = 0.5;
        brick_Obj.y += brick_Obj.height + 1;
      }
    }
    return newBricks;
  };

  const singleBrick = ({
    x,
    y,
    w,
    h,
    colors,
  }: {
    x: number;
    y: number;
    w: number;
    h: number;
    colors: string[];
  }): Brick => {
    let broke = false;
    let updatedX = x - w;
    let brokenStyles = "rgba(19, 73, 89, 0)";
    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.rect(updatedX, y, w, h);
      // if (colors[1]) {
      //   ctx.fillStyle = broke ? brokenStyles : colors[1];
      // }
      ctx.fillStyle = broke ? brokenStyles : "lightblue";

      ctx.lineWidth = 5;
      ctx.strokeStyle = broke ? brokenStyles : "transparent";
      ctx.fill();
      ctx.strokeRect(updatedX, y, w, h);
    };
    return {
      draw,
      x: updatedX,
      w,
      h,
      y,
      broke,
    };
  };

  const resetBall = ({ ballObj, paddleProps }: { ballObj: BallObj; paddleProps: PaddleProps }) => {
    ballObj.x = paddleProps.x;
    ballObj.y = paddleProps.y - 80;
    ballObj.dx = 6 * (Math.random() * 2 - 1);
    ballObj.dy = -6;
  };

  const handleAllBroken = ({
    bricks,
    player,
    ballObj,
    brickObj,
  }: {
    bricks?: Brick[];
    player: Player;
    ballObj: BallObj;
    brickObj: BrickObj;
  }) => {
    let total =
      bricks &&
      bricks.reduce((acc: number, current: Brick) => {
        if (current.broke) {
          return acc++;
        }
        return acc;
      }, 0);

    if (total === bricks?.length) {
      player.level++;
      resetBall({ ballObj, paddleProps });
      brickObj.y = 50;
    }
  };
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          paddleProps.y = canvas.height - 30;
          const brickSet = assignBrickSet({
            level: player.level,
            bricks: [],
            canvasEle: canvas,
            brick_Obj: brickObj,
          });

          if (brickSet && brickSet.length > 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            getPlayerStats({
              ctx: ctx,
              player: player,
              canvas: canvas,
            });

            if (brickSet) {
              brickSet.map((brick) => {
                return brick.draw(ctx);
              });
              console.log("bricks loaded", { brickSet });
            }

            handleBallMovement({
              ctx: ctx,
              ballObj: ballObj,
            });
            handleAllBroken({
              bricks: brickSet,
              ballObj: ballObj,
              player: player,
              brickObj: brickObj,
            });

            if (!player.lives) {
              alert("Game Over! Press ok to restart");
              player.lives = 5;
              player.level = 1;
              player.score = 0;
              resetBall({ ballObj, paddleProps });
            }

            handleWallCollision({
              ballObj: ballObj,
              canvas: canvas,
              player: player,
              paddleProps: paddleProps,
            });

            for (const brick of brickSet) {
              const brickCollision = handleBrickCollision({
                ballObj: ballObj,
                brickObj: brickObj,
              });

              if (brickCollision.hit && !brick.broke) {
                if (brickCollision.axis === "X") {
                  ballObj.dx *= -1;
                }
                if (brickCollision.axis === "Y") {
                  ballObj.dy *= -1;
                }
                brick.broke = true;
                player.score += 10;
              }
            }

            handlePaddle({
              ctx: ctx,
              paddleProps: paddleProps,
              canvas: canvas,
            });

            handlePaddleHit({
              ballObj: ballObj,
              paddleProps: paddleProps,
            });

            //end of runtime scope
            console.log({ brickSet });
            // requestAnimationFrame(render);
          }
        }
      }
      // requestAnimationFrame(render);
      //end of scope
    };
    render();
  }, []);

  let boardWidth: number | string = "1000px";
  useEffect(() => {
    if (window) {
      console.log(" window is defined");
      boardWidth =
        window.innerWidth < 900 ? window.innerWidth - 20 : window.innerWidth - (window.innerWidth * 20) / 100;
    }
  }, []);

  const handleCanvasMovement = (e: any) => {
    if (window) {
      paddleProps.x =
        e.clientX - (window.innerWidth < 900 ? 10 : (window.innerWidth * 20) / 200) - paddleProps.width / 2 - 10;
    }
  };

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      onMouseMove={(e) => handleCanvasMovement(e)}
      className=" flex justify-center border-2 border-gray-300 bg-white"
      height="500px"
      width={boardWidth}
      // width={window.innerWidth < 900 ? window.innerWidth - 20 : window.innerWidth - (window.innerWidth * 20) / 100}
      // style={{ height: "800px", width: "1500px" }}
      // height="800px"
      // width="1500px"
    />
  );
};

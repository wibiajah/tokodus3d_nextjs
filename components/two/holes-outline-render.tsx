import { Arcs, Holes, Lines } from "@/models/types";
import React from "react";
import { Shape } from "react-konva";
interface HolesParams {
  holes: Holes[];
}
export default function HolesOutlineRender({ holes }: HolesParams) {
  return (
    <>
      {holes.map((hole: Lines | Arcs, i: number) => (
        <React.Fragment key={i}>
          <Shape //Shape untuk Stroke (outline)
            sceneFunc={(ctx, shape) => {
              ctx.beginPath();
              switch (hole.kind) {
                case "arc": {
                  const arc = hole as Arcs;
                  const startAngle = (arc.rotation * Math.PI) / 180;
                  const endAngle = startAngle + (arc.angle * Math.PI) / 180;
                  ctx.arc(arc.x, arc.y, arc.radius, startAngle, endAngle);
                  if (arc.dash) ctx.setLineDash(arc.dash);
                  break;
                }
                case "line":
                case "lines": {
                  const line = hole as Lines;
                  if (line.points.length < 2) break;
                  ctx.moveTo(line.points[0], line.points[1]);
                  for (let j = 2; j < line.points.length; j += 2) {
                    ctx.lineTo(line.points[j], line.points[j + 1]);
                  }
                  if (line.dash) ctx.setLineDash(line.dash);
                  break;
                }
              }
              ctx.fillStrokeShape(shape);
            }}
            stroke={hole.stroke}
            strokeWidth={hole.strokeWidth}
          />
        </React.Fragment>
      ))}
    </>
  );
}

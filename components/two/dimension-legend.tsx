"use client";
import React from "react";
import { Group, Line, Text } from "react-konva";
import { Side } from "@/store/design-store";
import { DimensionItem } from "@/models/types";
interface DimensionLegendProps {
  dimensions: DimensionItem[];
  side: Side;
}
export function DimensionLegend({ dimensions, side }: DimensionLegendProps) {
  return (
    <Group listening={false}>
      {dimensions.map((d, i) => {
        const space = 40;
        const x = d.vertical
          ? (side === "inner"
            ? d.ru
            : d.u)
          : (side === "inner"
            ? d.ru
            : d.u);
        const y = d.vertical ? (side === "inner" ? d.rv : d.v) : (d.length >= 2.5*space ? -10 : 10);
        const linePoints = d.vertical
          ? [0, 0, 0, d.length]
          : [0, 0, d.length, 0];
        const tick1 = d.vertical ? [-4, 0, 4, 0] : [0, -4, 0, 4];
        const tick2 = d.vertical
          ? [-4, d.length, 4, d.length]
          : [d.length, -4, d.length, 4];
          const value = Number(d.value)/10;//cm
        return (
          <Group key={i} x={d.x} y={d.y}>
            {!d.vertical ? (
              <>
                <Line
                  points={[
                    linePoints[0],
                    linePoints[1],
                    (linePoints[0] + linePoints[2]) / 2 - (d.length >= 2.5*space ? space : 0),
                    (linePoints[1] + linePoints[3]) / 2,
                  ]}
                  stroke="blue"
                  strokeWidth={3}
                />
                <Line
                  points={[
                    (linePoints[0] + linePoints[2]) / 2 + (d.length >= 2.5*space ? space : 0),
                    (linePoints[1] + linePoints[3]) / 2,
                    linePoints[2],
                    linePoints[3],
                  ]}
                  stroke="blue"
                  strokeWidth={3}
                />
                <Line
                  points={[
                    linePoints[0] + 10,
                    linePoints[1] - 5,
                    linePoints[0],
                    linePoints[1],
                    linePoints[0] + 10,
                    linePoints[1] + 5,
                  ]}
                  stroke="blue"
                  strokeWidth={3}
                  lineCap="round"
                  lineJoin="round"
                />
                <Line
                  points={[
                    linePoints[2] - 10,
                    linePoints[3] - 5,
                    linePoints[2],
                    linePoints[3],
                    linePoints[2] - 10,
                    linePoints[3] + 5,
                  ]}
                  stroke="blue"
                  strokeWidth={3}
                  lineCap="round"
                  lineJoin="round"
                />
                <Line points={tick1} stroke="blue" strokeWidth={2} />
                <Line points={tick2} stroke="blue" strokeWidth={2} />
                <Text
                  x={x}
                  y={y}
                  text={`${value} cm`}
                  fontSize={16}
                  fontStyle="bold"
                  fill="blue"
                  align="center"
                  verticalAlign="middle"
                  scaleX={side === "inner" ? -1 : 1}
                />
              </>
            ) : (
              <>
                <Line
                  points={[
                    linePoints[0],
                    linePoints[1],
                    (linePoints[0] + linePoints[2]) / 2,
                    (linePoints[1] + linePoints[3]) / 2 - space / 3,
                  ]}
                  stroke="blue"
                  strokeWidth={3}
                />
                <Line
                  points={[
                    (linePoints[0] + linePoints[2]) / 2,
                    (linePoints[1] + linePoints[3]) / 2 + space / 3,
                    linePoints[2],
                    linePoints[3],
                  ]}
                  stroke="blue"
                  strokeWidth={3}
                />
                <Line
                  points={[
                    linePoints[0] - 5,
                    linePoints[1] + 10,
                    linePoints[0],
                    linePoints[1],
                    linePoints[0] + 5,
                    linePoints[1] + 10,
                  ]}
                  stroke="blue"
                  strokeWidth={3}
                  lineCap="round"
                  lineJoin="round"
                />
                <Line
                  points={[
                    linePoints[2] - 5,
                    linePoints[3] - 10,
                    linePoints[2],
                    linePoints[3],
                    linePoints[2] + 5,
                    linePoints[3] - 10,
                  ]}
                  stroke="blue"
                  strokeWidth={3}
                  lineCap="round"
                  lineJoin="round"
                />
                <Text
                  x={x}
                  y={y}
                  text={`${value} cm`}
                  fontSize={16}
                  fontStyle="bold"
                  fill="blue"
                  align="center"
                  verticalAlign="middle"
                  scaleX={side === "inner" ? -1 : 1}
                />
              </>
            )}
          </Group>
        );
      })}
    </Group>
  );
}

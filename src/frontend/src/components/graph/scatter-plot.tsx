import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  label: string;
  x: number;
  y: number;
}

interface GraphProperties {
  "graph title"?: string;
  "Selected Dates"?: string[];
  "x time min"?: number;
  "x time max"?: number;
  "y time min"?: number;
  "y time max"?: number;
  "min x"?: number;
  "max x"?: number;
  "min y"?: number;
  "max y"?: number;
  "x label"?: string;
  "y label"?: string;
}

interface ScatterPlotProps {
  data: DataPoint[];
  properties?: GraphProperties;
  width?: number;
  height?: number;
  lineData: Array<{ x: number; y: number }>;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ 
  data, 
  properties = {},
  width = 928,
  height = 600,
  lineData
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 30
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xMin = properties["min x"] ?? d3.min(data, d => d.x) ?? 0;
    const xMax = properties["max x"] ?? d3.max(data, d => d.x) ?? 0;

    const yMin = properties["min y"] ?? d3.min(data, d => d.y) ?? 0;
    const yMax = properties["max y"] ?? d3.max(data, d => d.y) ?? 0;

    const xScale = d3.scaleUtc()
      .domain([xMin, xMax])
      .range([margin.left, width - margin.right])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height - margin.bottom, margin.top])
      .nice();

    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .style("fill", "#4299e1")
      .style("opacity", 0.6)
      .append("title")
      .text(d => d.label);
    
    if (lineData && lineData.length > 0) {
      g.append("line")
        .attr("x1", xScale(lineData[0].x)) // X1
        .attr("y1", yScale(lineData[0].y)) // Y1
        .attr("x2", xScale(lineData[1].x)) // X2
        .attr("y2", yScale(lineData[1].y)) // Y2
        .style("stroke", "black")
        .style("stroke-width", 1);
    }

    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .call(g => g.append("text")
        .attr("x", width - margin.right)
        .attr("y", -6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(properties["x label"] || ""));

    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .call(g => g.append("text")
        .attr("x", 6)
        .attr("y", margin.top)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(properties["y label"] || ""));

    if (properties["graph title"]) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(properties["graph title"]);
    }

  }, [data, properties, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default ScatterPlot;

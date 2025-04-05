// -----------------------------------------------------------------------------
// Primary Author: Sumanya G
// Year: 2025
// Component: line-graph
// Purpose: D3 Line Graph component for displaying data points.
// -----------------------------------------------------------------------------

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  label: string;
  x: number;
  y: number;
}

interface LineGraphProps {
  data: DataPoint[];
  properties?: {
    "graph title"?: string;
    "x label"?: string;
    "y label"?: string;
    "min x"?: number;
    "max x"?: number;
    "min y"?: number;
    "max y"?: number;
  };
  width?: number;
  height?: number;
}

const LineGraph: React.FC<LineGraphProps> = ({ 
  data, 
  properties = {},
  width = 800,
  height = 500
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 50, bottom: 70, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const sortedData = [...data].sort((a, b) => a.x - b.x);

    const xDomain = [
      properties["min x"] ?? d3.min(data, d => d.x) ?? 0,
      properties["max x"] ?? d3.max(data, d => d.x) ?? 1
    ];
    const yDomain = [
      properties["min y"] ?? d3.min(data, d => d.y) ?? 0,
      properties["max y"] ?? d3.max(data, d => d.y) ?? 1
    ];

    const xScale = d3.scaleLinear()
      .domain([xDomain[0] - (xDomain[1] - xDomain[0]) * 0.05, 
               xDomain[1] + (xDomain[1] - xDomain[0]) * 0.05])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([yDomain[0] - (yDomain[1] - yDomain[0]) * 0.05, 
               yDomain[1] + (yDomain[1] - yDomain[0]) * 0.05])
      .range([innerHeight, 0])
      .nice();

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat("" as any));

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("" as any));

    const line = d3.line<DataPoint>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(sortedData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line);

    const circles = g.selectAll("circle")
      .data(sortedData)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 4)
      .style("fill", "#3b82f6")
      .style("opacity", 0.7)
      .style("stroke", "#1e40af")
      .style("stroke-width", 1)

    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "sans-serif");
    
    xAxis.selectAll("path, line")
      .style("stroke", "#64748b");

    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(properties["x label"] || "");

    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale));
    
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "sans-serif");
    
    yAxis.selectAll("path, line")
      .style("stroke", "#64748b");

    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(properties["y label"] || "");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(properties["graph title"] || "");

  }, [data, properties, width, height]);

  return (
    <div style={{ position: "relative" }}>
      <svg 
        ref={svgRef} 
        style={{
          display: "block",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
        }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          padding: "8px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          borderRadius: "4px",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.2s",
          fontSize: "14px",
          zIndex: 10
        }}
      />
    </div>
  );
};

export default LineGraph;
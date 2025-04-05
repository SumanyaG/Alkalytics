// -----------------------------------------------------------------------------
// Primary Author: Sumanya G
// Year: 2025
// Component: scatter-plot
// Purpose: D3 Scatter Plot component for displaying data points.
// -----------------------------------------------------------------------------

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  label: string;
  x: number;
  y: number;
}

interface ScatterPlotProps {
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
  lineData?: Array<{ x: number; y: number }>;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  properties = {},
  width = 800,
  height = 500,
  lineData = []
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = {
      top: 50,
      right: 50,
      bottom: 70,
      left: 70
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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
      .attr("y", 40)
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

    const circles = g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 4) 
      .attr("data-id", d => d.label) 
      .style("fill", "#3b82f6")
      .style("opacity", 0.7)
      .style("stroke", "#1e3a8a")
      .style("stroke-width", 0.8);

    const delaunay = d3.Delaunay.from(
      data,
      d => xScale(d.x),
      d => yScale(d.y)
    );
    const voronoi = delaunay.voronoi([0, 0, innerWidth, innerHeight]);

    g.selectAll(".voronoi")
      .data(data)
      .join("path")
      .attr("class", "voronoi")
      .attr("d", (d,i) => voronoi.renderCell(i))
      .style("pointer-events", "all")
      .style("fill", "none")

    if (lineData && lineData.length >= 2) {
      g.append("line")
        .attr("x1", xScale(lineData[0].x))
        .attr("y1", yScale(lineData[0].y))
        .attr("x2", xScale(lineData[1].x))
        .attr("y2", yScale(lineData[1].y))
        .attr("stroke", "#ef4444") 
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 2");
    }

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(properties["graph title"] || "");

  }, [data, properties, width, height, lineData]);

  const tooltipRef = useRef<HTMLDivElement>(null);

  return <svg ref={svgRef} style={{
    display: "block",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
  }} />;
};

export default ScatterPlot;
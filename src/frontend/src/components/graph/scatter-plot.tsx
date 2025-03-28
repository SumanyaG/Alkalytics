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

    // Enhanced margins
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

    // Calculate domains with 5% padding
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

    // X Axis with proper typing
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    // Apply styles to axis elements
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

    // Y Axis with proper typing
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale));
    
    // Apply styles to axis elements
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

    // Data points
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .style("fill", "#3b82f6")
      .style("opacity", 0.8);

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(properties["graph title"] || "");

  }, [data, properties, width, height, lineData]);

  return <svg ref={svgRef} style={{
    display: "block",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
  }} />;
};

export default ScatterPlot;
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
  width = 1000,
  height = 700,
  lineData
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = {
      top: 30,
      right: 25,
      bottom: 60,
      left: 20
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

    const autoXLabel = generateXLabel(properties);
    const autoYLabel = generateYLabel(properties);
    const autoTitle = generateTitle(properties);

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
        .text(properties["x label"] || autoXLabel));

    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .call(g => g.append("text")
        .attr("x", 6)
        .attr("y", margin.top)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(properties["y label"] || autoYLabel));

    const titleText = properties["graph title"] || autoTitle;
    if (titleText) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(titleText);
    }

  }, [data, properties, width, height]);

  const generateXLabel = (props: GraphProperties): string => {
    if (props["x time min"] !== undefined && props["x time max"] !== undefined) {
      return "Time";
    }
    if (props["min x"] !== undefined && props["max x"] !== undefined) {
      return "X Value";
    }
    return "X Axis";
  }

  const generateYLabel = (props: GraphProperties): string => {
    if (props["y time min"] !== undefined && props["y time max"] !== undefined) {
      return "Time";
    }
    if (props["min y"] !== undefined && props["max y"] !== undefined) {
      return "Y Value";
    }
    return "Y Axis";
  }

  const generateTitle = (props: GraphProperties): string => {
    if (props["Selected Dates"] && props["Selected Dates"].length > 0) {
      return `Data for ${props["Selected Dates"].join(", ")}`;
    }

    const xPart = props["min x"] !== undefined && props["max x"] !== undefined 
      ? `X: ${props["min x"]} to ${props["max x"]}` 
      : "";
  
    const yPart = props["min y"] !== undefined && props["max y"] !== undefined 
      ? `Y: ${props["min y"]} to ${props["max y"]}` 
      : "";
    
    if (xPart && yPart) {
      return `Scatter Plot (${xPart}, ${yPart})`;
    } else if (xPart) {
      return `Scatter Plot (${xPart})`;
    } else if (yPart) {
      return `Scatter Plot (${yPart})`;
    }

    return "Scatter Plot";
  }

  return <svg ref={svgRef}></svg>;
};

export default ScatterPlot;
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type ScatterPlotProps = {
  data: Array<{ x: number; y: number }>;
  width: number;
  height: number;
};

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.x) ?? 0,
        d3.max(data, d => d.x) ?? 0
      ])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.y) ?? 0,
        d3.max(data, d => d.y) ?? 0
      ])
      .range([innerHeight, 0])
      .nice();

    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .style("fill", "#4299e1")
      .style("opacity", 0.6);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .call(d3.axisLeft(yScale));

  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default ScatterPlot;
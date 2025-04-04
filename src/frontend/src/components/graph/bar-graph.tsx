import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  label: string;
  x: number;
  y: number;
}

interface BarGraphProps {
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

const BarGraph: React.FC<BarGraphProps> = ({ 
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

    const margin = { top: 70, right: 50, bottom: 100, left: 70 };
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

    const xDomain = sortedData.map(d => d.x.toString());
    const yDomain = [
      properties["min y"] ?? 0,
      properties["max y"] ?? d3.max(data, d => d.y) ?? 1
    ];

    const xScale = d3.scaleBand()
      .domain(xDomain)
      .range([0, innerWidth])
      .padding(0.4);

    const yScale = d3.scaleLinear()
      .domain([yDomain[0], yDomain[1] + (yDomain[1] - yDomain[0]) * 0.05])
      .range([innerHeight, 0])
      .nice();

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("" as any));

    const bars = g.selectAll("rect")
      .data(sortedData)
      .join("rect")
      .attr("x", d => xScale(d.x.toString()) || 0)
      .attr("y", d => yScale(d.y))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.y))
      .attr("fill", "#3b82f6")
      .attr("rx", 2)
      .attr("ry", 2)
      .style("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .style("opacity", 1)
          .attr("fill", "#2563eb");

        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "1";
          tooltipRef.current.style.left = `${event.pageX + 10}px`;
          tooltipRef.current.style.top = `${event.pageY + 10}px`;
          tooltipRef.current.innerHTML = `
            <div><strong>${d.label || "Bar"}</strong></div>
            <div>Value: ${d.y.toFixed(2)}</div>
          `;
        }
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("opacity", 0.8)
          .attr("fill", "#3b82f6");

        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = "0";
        }
      });

    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0)); 

    /*
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .attr("transform", "rotate(-45)") // Rotate labels to prevent overlap
      .attr("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em");  
    */

    xAxis.selectAll("text")
      .style("display", "none"); // Hide x-axis labels
    
    xAxis.selectAll("path")
      .style("stroke", "#64748b");

    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 60)
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
      .attr("y", 40)
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

export default BarGraph;